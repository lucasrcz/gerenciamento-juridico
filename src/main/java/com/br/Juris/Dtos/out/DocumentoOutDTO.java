package com.br.Juris.Dtos.out;

import com.br.Juris.Entities.Documento;

import java.time.LocalDateTime;

public record DocumentoOutDTO(Long id, String nome, LocalDateTime dataCriacao, String formatoArquivo, String descricao, Long processoId) {

    public static DocumentoOutDTO fromEntity(Documento entity){
        return new DocumentoOutDTO(entity.getId(), entity.getNome(),
                entity.getDataCriacao(), entity.getFormatoArquivo(),
                entity.getDescricao(),entity.getProcesso().getId());
    }
}
