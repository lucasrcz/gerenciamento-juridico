package com.br.Juris.Services;

import com.br.Juris.Dtos.in.ProcessoInDTO;
import com.br.Juris.Dtos.in.ProcessoParteInDTO;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Dtos.out.PrazosOutDTO;
import com.br.Juris.Dtos.out.ProcessoOutDTO;
import com.br.Juris.Entities.Advogado;
import com.br.Juris.Entities.Contrato;
import com.br.Juris.Entities.Partes;
import com.br.Juris.Entities.Processo;
import com.br.Juris.Entities.ProcessoParte;
import com.br.Juris.Enums.EstadoBrasil;
import com.br.Juris.Enums.StatusProcesso;
import com.br.Juris.Repositories.ProcessoRepository;
import com.br.Juris.Services.security.AuthorizationService;
import jakarta.annotation.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;


@Service
public class ProcessosService {

    @Resource
    ProcessoRepository repository;

    @Resource
    PartesService partesService;

    @Resource
    AuthorizationService authorizationService;

    public ProcessoOutDTO getById(Long id) {
        Processo processo = findById(id);
        return ProcessoOutDTO.fromEntity(processo);
    }

    @Transactional
    public MessageOutDTO create(ProcessoInDTO dto) throws IOException {
        Processo processo = ProcessoInDTO.toEntity(dto);
        if(dto.partes() != null && !dto.partes().isEmpty())vincularPartes(dto.partes(),processo);
        if(dto.advogadosIds() != null && !dto.advogadosIds().isEmpty())vincularAdvogados(dto.advogadosIds(),processo);
        if(dto.advogadoPrincipalId() != null) processo.setAdvogadoResponsavel(authorizationService.findById(dto.advogadoPrincipalId()));
        processo = repository.save(processo);
        return new MessageOutDTO(processo.getId(),String.format("Processo Nº %s criado com sucesso",processo.getNumero()));
    }

    @Transactional
    public MessageOutDTO delete(Long id) {
        Processo processo = findById(id);
        String numeroProceso = processo.getNumero();
        repository.delete(processo);
        return new MessageOutDTO(processo.getId(),String.format("Processo Nº %s Deletado com sucesso",numeroProceso));
    }

    public Processo findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        String.format("Processo de ID: %s não encontrado", id)));
    }

    @Transactional(readOnly = true)
    public Page<ProcessoOutDTO> listAllPageable(
            String numero,
            StatusProcesso status,
            EstadoBrasil estado,
            String advogadoId,
            List<String> advogadosIds,
            List<Long> partesIds,
            Pageable pageable
    ) {

        UUID advogadoUUID = advogadoId != null && !advogadoId.isBlank()
                ? UUID.fromString(advogadoId)
                : null;

        List<UUID> advogadosUUIDs =
                advogadosIds == null || advogadosIds.isEmpty()
                        ? null
                        : advogadosIds.stream()
                        .filter(Objects::nonNull)
                        .map(UUID::fromString)
                        .toList();

        List<Long> partesIdsFiltro =
                partesIds == null || partesIds.isEmpty()
                        ? null
                        : partesIds;

        String numeroFiltro =
                numero == null || numero.isBlank()
                        ? null
                        : numero.trim();

        return repository.buscarComFiltros(
                numeroFiltro,
                status,
                estado,
                advogadoUUID,
                advogadosUUIDs,
                partesIdsFiltro,
                pageable
        ).map(ProcessoOutDTO::fromEntity);
    }



    @Transactional
    public MessageOutDTO update(Long id, ProcessoInDTO dto) throws IOException {
        Processo processoExistente = findById(id);

        atualizarDadosSimples(processoExistente, dto);


        if (dto.advogadosIds() != null) {
            processoExistente.getAdvogados().clear();
            if (!dto.advogadosIds().isEmpty()) {
                vincularAdvogados(dto.advogadosIds(), processoExistente);
            }
        }

        if (dto.partes() != null) {
            processoExistente.getProcessoPartes().clear();
            if (!dto.partes().isEmpty()) {
                vincularPartes(dto.partes(), processoExistente);
            }
        }

        if(dto.advogadoPrincipalId() != null) vincularAdvogadoPrincipal(dto.advogadoPrincipalId(),processoExistente);

        processoExistente = repository.save(processoExistente);

        return new MessageOutDTO(processoExistente.getId(), String.format("Processo Nº %s atualizado com sucesso", processoExistente.getNumero()));
    }

    @Transactional(readOnly = true)
    public List<PrazosOutDTO> listPrazos(Long id){
        Processo processo = this.findById(id);
        return processo.getPrazos().stream().map(PrazosOutDTO::fromEntity).toList();
    }

    private void atualizarDadosSimples(Processo processo, ProcessoInDTO dto) throws IOException {
        processo.setNumero(dto.numero());
        processo.setObservacoes(dto.observacoes());
        processo.setStatus(dto.status());
        processo.setEstado(dto.estado());
        
        // Verificar se contrato não é null e não está vazio antes de atualizar
        if(dto.contrato() != null && !dto.contrato().isEmpty()){
            // Se já existe um contrato, atualiza
            if(processo.getContrato() != null) {
                processo.getContrato().updateContrato(dto.contrato());
            } 
            // Se não existe, cria um novo
            else {
                Contrato novoContrato = new Contrato();
                novoContrato.setNome(dto.contrato().getOriginalFilename());
                novoContrato.setDados(dto.contrato().getBytes());
                novoContrato.setProcesso(processo);
                processo.setContrato(novoContrato);
            }
        }
        // Se contrato for null ou vazio, mantém o contrato existente
    }

    private void vincularPartes(List<ProcessoParteInDTO> dtos , Processo processo){
        List<ProcessoParte> processoPartes = new ArrayList<>();
        for (ProcessoParteInDTO dto : dtos) {
            Partes parte = partesService.findById(dto.parteId());
            ProcessoParte processoParte = new ProcessoParte(processo,parte,dto.tipoParte(),dto.observacoes());
            processoPartes.add(processoParte);
        }
        processo.getProcessoPartes().addAll(processoPartes);
    }

    private void vincularAdvogados(List<String> ids, Processo processo){
        List<Advogado> advogados = authorizationService.findAllByCpf(ids);
        processo.getAdvogados().addAll(advogados);
    }

    private void vincularAdvogadoPrincipal(String id,Processo processo){
        processo.setAdvogadoResponsavel(authorizationService.findById(id));
    }

}
