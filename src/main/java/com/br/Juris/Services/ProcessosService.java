package com.br.Juris.Services;

import com.br.Juris.Dtos.in.ProcessoInDTO;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Dtos.out.ProcessoOutDTO;
import com.br.Juris.Entities.Processo;
import com.br.Juris.Repositories.ProcessoRepository;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;


@Service
public class ProcessosService {

    @Resource
    ProcessoRepository repository;

    public ProcessoOutDTO getById(Long id) {
        Processo processo = findById(id);
        return ProcessoOutDTO.fromEntity(processo);
    }


    @Transactional
    public MessageOutDTO create(ProcessoInDTO dto) throws IOException {
        Processo processo = ProcessoInDTO.toEntity(dto);
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

    public Page<ProcessoOutDTO> listAll(Pageable pageable) {
        Page<Processo> processos = repository.findAll(pageable);
        return processos.map(ProcessoOutDTO::fromEntity);
    }
}
