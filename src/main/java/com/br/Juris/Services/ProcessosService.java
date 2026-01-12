package com.br.Juris.Services;

import com.br.Juris.Dtos.in.ProcessoInDTO;
import com.br.Juris.Dtos.in.ProcessoParteInDTO;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Dtos.out.ProcessoOutDTO;
import com.br.Juris.Entities.Advogado;
import com.br.Juris.Entities.Partes;
import com.br.Juris.Entities.Processo;
import com.br.Juris.Entities.ProcessoParte;
import com.br.Juris.Repositories.PartesRepository;
import com.br.Juris.Repositories.ProcessoRepository;
import com.br.Juris.Services.security.AuthorizationService;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;


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

    public Page<ProcessoOutDTO> listAllPageable(Pageable pageable) {
        Page<Processo> processos = repository.findAll(pageable);
        return processos.map(ProcessoOutDTO::fromEntity);
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
}
