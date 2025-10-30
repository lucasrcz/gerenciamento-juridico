package com.br.Juris.Services;

import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Entities.Contrato;
import com.br.Juris.Repositories.ContratosRepository;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class ContratosService {

    @Resource
    ContratosRepository repository;


    public Contrato findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        String.format("Contrato de ID: %s não encontrado", id)));
    }

    @Transactional
    public MessageOutDTO delete(Long id) {
        Contrato contrato = findById(id);
        repository.delete(contrato);
        return new MessageOutDTO(id,"Contrato deletado com sucesso");
    }


    @Transactional
    public MessageOutDTO update(Long id, MultipartFile arquivo) throws IOException {
        Contrato contrato = findById(id);
        contrato.updateContrato(arquivo);
        return new MessageOutDTO(id,"Contrato atualizado com sucesso");
    }


}
