package com.br.Juris.Dtos.out;

import com.br.Juris.Entities.Contrato;

import java.io.Serializable;

/**
 * DTO for {@link com.br.Juris.Entities.Contrato}
 */
public record ContratoOutDTO(
        Long id,
        String nome  // ✅ Deve incluir o nome
) implements Serializable {

    public static ContratoOutDTO fromEntity(Contrato contrato) {
        if (contrato == null) {
            return null;
        }
        
        return new ContratoOutDTO(
                contrato.getId(),
                contrato.getNome()  // ✅ Retornar nome do arquivo
        );
    }
}
