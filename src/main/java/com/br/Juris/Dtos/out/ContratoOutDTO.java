package com.br.Juris.Dtos.out;

import com.br.Juris.Entities.Contrato;

public record ContratoOutDTO(Long id, String name) {

    public static  ContratoOutDTO fromEntity(Contrato contrato) {
        return new ContratoOutDTO(contrato.getId(),contrato.getNome());
    }
}
