package com.br.Juris.Services;

import com.br.Juris.Dtos.in.ClientesSelectDTO;
import com.br.Juris.Dtos.in.EnderecoInDTO;
import com.br.Juris.Dtos.in.PartesInDTO;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Dtos.out.PartesOutDTO;
import com.br.Juris.Entities.Endereco;
import com.br.Juris.Entities.Partes;
import com.br.Juris.Repositories.PartesRepository;
import jakarta.annotation.Resource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PartesService {

    @Resource
    PartesRepository repository;

    public PartesOutDTO getById(Long id) {
        Partes parte = findById(id);
        return PartesOutDTO.fromEntity(parte);
    }

    @Transactional
    public MessageOutDTO create(PartesInDTO dto) {
        Partes parte = PartesInDTO.toEntity(dto);
        repository.save(parte);

        return new MessageOutDTO(
                parte.getId(),
                String.format("Parte %s cadastrada com sucesso", parte.getNome())
        );
    }

    @Transactional
    public MessageOutDTO update(Long id, PartesInDTO dto) {
        Partes parte = findById(id);

        parte.setNome(dto.nome());
        parte.setTipoPessoa(dto.tipoPessoa());
        parte.setDocumento(dto.documento());
        parte.setEmail(dto.email());
        parte.setTelefone(dto.telefone());
        parte.setObservacoes(dto.observacoes());
        if (dto.endereco() != null) {
            EnderecoInDTO e = dto.endereco();
            Endereco endereco = parte.getEndereco();
            endereco.setLogradouro(e.logradouro());
            endereco.setNumero(e.numero());
            endereco.setComplemento(e.complemento());
            endereco.setBairro(e.bairro());
            endereco.setCidade(e.cidade());
            endereco.setEstado(e.estado());
            endereco.setCep(e.cep());
        }

        repository.save(parte);

        return new MessageOutDTO(
                parte.getId(),
                String.format("Parte %s atualizada com sucesso", parte.getNome())
        );
    }

    @Transactional
    public MessageOutDTO delete(Long id) {
        Partes parte = findById(id);
        repository.delete(parte);

        return new MessageOutDTO(
                parte.getId(),
                String.format("Parte %s removida com sucesso", parte.getNome())
        );
    }

    public Page<PartesOutDTO> listAllPageable(Pageable pageable) {
        return repository.findAll(pageable)
                .map(PartesOutDTO::fromEntity);
    }

    public Partes findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        String.format("Parte de ID %s não encontrada", id)
                ));
    }

    @Transactional
    public List<ClientesSelectDTO> buscarParaSelect(String query) {

        return repository.buscarParaSelect(query.trim());
    }
}

