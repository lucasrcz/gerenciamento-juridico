package com.br.Juris.Services;

import com.br.Juris.Dtos.in.ProcessoInDTO;
import com.br.Juris.Dtos.in.ProcessoParteInDTO;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Dtos.out.PrazosOutDTO;
import com.br.Juris.Dtos.out.ProcessoOutDTO;
import com.br.Juris.Entities.*;
import com.br.Juris.Enums.EstadoBrasil;
import com.br.Juris.Enums.StatusProcesso;
import com.br.Juris.Repositories.ProcessoRepository;
import com.br.Juris.Services.security.AuthorizationService;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.*;

@Service
@Transactional
public class ProcessosService {

    @Autowired
    private ProcessoRepository repository;
    
    @Autowired
    private EntityManager entityManager;
    
    @Autowired
    private AuthorizationService authorizationService;
    
    @Autowired
    private PartesService partesService;

    public ProcessoOutDTO getById(Long id) {
        Processo processo = findById(id);
        return ProcessoOutDTO.fromEntity(processo);
    }

    @Transactional
    public MessageOutDTO create(ProcessoInDTO dto) throws IOException {
        Processo processo = ProcessoInDTO.toEntity(dto);
        if(dto.partes() != null && !dto.partes().isEmpty()) vincularPartes(dto.partes(), processo);
        if(dto.advogadosIds() != null && !dto.advogadosIds().isEmpty()) vincularAdvogados(dto.advogadosIds(), processo);
        if(dto.advogadoPrincipalId() != null) processo.setAdvogadoResponsavel(authorizationService.findById(dto.advogadoPrincipalId()));
        processo = repository.save(processo);
        return new MessageOutDTO(processo.getId(), String.format("Processo Nº %s criado com sucesso", processo.getNumero()));
    }

    @Transactional
    public MessageOutDTO delete(Long id) {
        Processo processo = findById(id);
        String numeroProceso = processo.getNumero();
        repository.delete(processo);
        return new MessageOutDTO(processo.getId(), String.format("Processo Nº %s Deletado com sucesso", numeroProceso));
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

        // 1. Atualizar dados simples
        processoExistente.setNumero(dto.numero());
        processoExistente.setObservacoes(dto.observacoes());
        processoExistente.setStatus(dto.status());
        processoExistente.setEstado(dto.estado());

        // 2. Atualizar contrato (CORRIGIDO - usando métodos corretos)
        if (dto.contrato() != null && !dto.contrato().isEmpty()) {
            Contrato contratoAtual = processoExistente.getContrato();
            
            if (contratoAtual != null) {
                // Atualizar contrato existente usando o método da entidade
                contratoAtual.updateContrato(dto.contrato());
            } else {
                // Criar novo contrato
                Contrato novoContrato = new Contrato();
                novoContrato.setNome(dto.contrato().getOriginalFilename());
                novoContrato.setDados(dto.contrato().getBytes());
                novoContrato.setProcesso(processoExistente);
                processoExistente.setContrato(novoContrato);
            }
        }

        // 3. Advogado Principal
        if(dto.advogadoPrincipalId() != null) {
            processoExistente.setAdvogadoResponsavel(authorizationService.findById(dto.advogadoPrincipalId()));
        }

        // 4. Advogados Associados
        if (dto.advogadosIds() != null) {
            processoExistente.getAdvogados().clear();
            if (!dto.advogadosIds().isEmpty()) {
                List<Advogado> advogados = authorizationService.findAllByCpf(dto.advogadosIds());
                processoExistente.getAdvogados().addAll(advogados);
            }
        }

        // 5. PARTES
        if (dto.partes() != null) {
            // Remover partes antigas usando query nativa
            entityManager.createNativeQuery("DELETE FROM processo_partes WHERE processo_id = :processoId")
                    .setParameter("processoId", id)
                    .executeUpdate();
            
            // Limpar a coleção
            processoExistente.getProcessoPartes().clear();
            
            // Flush para sincronizar
            entityManager.flush();
            
            // Adicionar novas partes
            if (!dto.partes().isEmpty()) {
                for (ProcessoParteInDTO parteDTO : dto.partes()) {
                    Partes parte = partesService.findById(parteDTO.parteId());
                    
                    ProcessoParte processoParte = new ProcessoParte();
                    processoParte.setProcesso(processoExistente);
                    processoParte.setParte(parte);
                    processoParte.setTipoParte(parteDTO.tipoParte());
                    
                    // Persistir diretamente
                    entityManager.persist(processoParte);
                    processoExistente.getProcessoPartes().add(processoParte);
                }
            }
        }

        // 6. Salvar processo
        processoExistente = repository.save(processoExistente);

        return new MessageOutDTO(processoExistente.getId(), String.format("Processo Nº %s atualizado com sucesso", processoExistente.getNumero()));
    }

    @Transactional(readOnly = true)
    public List<PrazosOutDTO> listPrazos(Long id){
        Processo processo = this.findById(id);
        return processo.getPrazos().stream().map(PrazosOutDTO::fromEntity).toList();
    }

    private void vincularPartes(List<ProcessoParteInDTO> dtos, Processo processo){
        for (ProcessoParteInDTO dto : dtos) {
            Partes parte = partesService.findById(dto.parteId());
            ProcessoParte processoParte = new ProcessoParte();
            processoParte.setProcesso(processo);
            processoParte.setParte(parte);
            processoParte.setTipoParte(dto.tipoParte());
            
            processo.getProcessoPartes().add(processoParte);
        }
    }

    private void vincularAdvogados(List<String> ids, Processo processo){
        List<Advogado> advogados = authorizationService.findAllByCpf(ids);
        processo.getAdvogados().addAll(advogados);
    }
}
