package com.br.Juris.Dtos.in;


import com.br.Juris.Entities.Documento;
import com.br.Juris.Entities.Processo;
import com.br.Juris.Utils.FileUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public record DocumentoInDTO(String descricao, MultipartFile arquivo) {

    public static Documento toEntity(DocumentoInDTO dto, Processo processo) throws IOException {
        MultipartFile file = dto.arquivo();
        FileUtils.checkFile(file);
        return new Documento(file.getOriginalFilename(),
                file.getBytes(),
                file.getContentType(),
                dto.descricao.isBlank() ? null : dto.descricao()
                ,processo);
        }

        public static List<DocumentoInDTO> fromList(List<MultipartFile> arquivos,List<String> descricao){
            List<DocumentoInDTO> dtos = new ArrayList<>();
            for (int i = 0; i < arquivos.size(); i++) {
                DocumentoInDTO dto = new DocumentoInDTO(descricao.get(i),arquivos.get(i));
                dtos.add(dto);
            }

            return dtos;
        }
    }
