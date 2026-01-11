package com.br.Juris.Dtos.in;


import com.br.Juris.Entities.Prazo;
import com.br.Juris.Entities.Processo;

import java.time.LocalDateTime;

public record PrazoInDTO(LocalDateTime dataVencimento, String descricao, Long idProcesso) {

    public static Prazo toEntity(PrazoInDTO prazo, Processo processo) {
        Prazo entity = new Prazo();
        entity.setProcesso(processo);
        entity.setDataVencimento(prazo.dataVencimento());
        entity.setDescricao(prazo.descricao);
        return entity;
    }
}
