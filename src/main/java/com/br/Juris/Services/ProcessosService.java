package com.br.Juris.Services;

import com.br.Juris.Dtos.in.ProcessoInDto;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Dtos.out.ProcessoOutDto;
import com.br.Juris.Entities.Processo;
import com.br.Juris.Repositories.ProcessoRepository;
import jakarta.annotation.Resource;
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

    public ProcessoOutDto getById(Long id) {
        Processo processo = findById(id);
        return ProcessoOutDto.fromEntity(processo);
    }


    public MessageOutDTO create(ProcessoInDto dto) throws IOException {
        Processo processo = ProcessoInDto.toEntity(dto);
        processo = repository.save(processo);
        return new MessageOutDTO(processo.getId(),String.format("Processo Nº %s criado com sucesso",processo.getNumero()));
    }

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

    public Page<ProcessoOutDto> listAll(Pageable pageable) {
        Page<Processo> processos = repository.findAll(pageable);
        return processos.map(ProcessoOutDto::fromEntity);
    }
}
