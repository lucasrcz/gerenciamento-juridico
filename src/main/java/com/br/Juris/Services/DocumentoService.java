package com.br.Juris.Services;


import com.br.Juris.Dtos.in.DocumentoInDTO;
import com.br.Juris.Dtos.out.DocumentoOutDTO;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Entities.Documento;
import com.br.Juris.Entities.Processo;
import com.br.Juris.Repositories.DocumentoRepository;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentoService {

    @Resource
    DocumentoRepository repository;

    @Resource
    ProcessosService processosService;

    public Documento findById(Long id){
        return repository.findById(id).orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,
                String.format("Documento de ID: %s não encontrado", id)));
    }

    public Page<DocumentoOutDTO> listAllPageableByIdProcesso(Long id,
                                                             Pageable pageable){
       return repository.findAllByProcesso_Id(id,pageable).map(DocumentoOutDTO::fromEntity);
    }


    @Transactional
    public MessageOutDTO createDocumentos(List<DocumentoInDTO> dtos,
                                          Long idProcesso) {

        if (dtos == null || dtos.isEmpty()) {
            throw new IllegalArgumentException("Nenhum documento foi enviado");
        }

        Processo processo = processosService.findById(idProcesso);

        List<Documento> documentos = dtos.stream()
                .map(dto -> {
                    try {
                        return DocumentoInDTO.toEntity(dto, processo);
                    } catch (IOException e) {
                        throw new RuntimeException(
                                "Erro ao processar arquivo: " + dto.arquivo().getOriginalFilename(), e
                        );
                    }
                })
                .collect(Collectors.toList());

        repository.saveAll(documentos);

        return new MessageOutDTO(
                processo.getId(),
                String.format(
                        "Documentos salvos com sucesso do Processo de número: %s",
                        processo.getNumero()
                )
        );
    }

    @Transactional
    public MessageOutDTO deleteBatch(List<Long> ids) {
        List<Documento> documentos = repository.findAllById(ids);
        if(documentos.isEmpty()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Nenhum documento foi encontrado para deletar, tente novamente.");
        }
        repository.deleteAll(documentos);
        return new MessageOutDTO(null,String.format("Documentos deletados com sucesso"));
    }

    @Transactional
    public MessageOutDTO updateDocumento(List<Long> id, List<DocumentoInDTO> dtos) {
        for (int i = 0; i < id.size(); i++) {
            Documento documento = findById(id.get(i));
            try{
                documento.setArquivo(dtos.get(i).arquivo().getBytes());
                documento.setDescricao(dtos.get(i).descricao().isBlank() ? null : dtos.get(i).descricao());
                documento.setFormatoArquivo(dtos.get(i).arquivo().getContentType());
                repository.save(documento);
            }catch (IOException e){
                throw  new ResponseStatusException(HttpStatus.BAD_REQUEST,"Erro ao processar arquivo: " + dtos.get(i).arquivo().getOriginalFilename());
            }
        }
        return new MessageOutDTO(null,String.format("Documentos editados com sucesso"));
    }
}
