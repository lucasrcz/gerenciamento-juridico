package com.br.Juris.Dtos.out;

import com.br.Juris.Entities.Prazo;

import java.time.LocalDateTime;

public record PrazosOutDTO(LocalDateTime dataVencimento, String descricao, Long diasFimPrazo,
                           Long idProcesso, String numeroProcesso) {

    public static PrazosOutDTO fromEntity(Prazo entity) {
        return new PrazosOutDTO(entity.getDataVencimento(),entity.getDescricao(), entity.getDiasRestantes(),
                entity.getProcesso().getId(),entity.getProcesso().getNumero());
    }

}
