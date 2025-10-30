package com.br.Juris.Dtos.out;

import com.br.Juris.Entities.Processo;
import com.br.Juris.Enums.StatusProcesso;

import java.io.Serializable;

/**
 * DTO for {@link com.br.Juris.Entities.Processo}
 */
public record ProcessoOutDTO(Long id, String numero, StatusProcesso status, String observacoes,
                             String estado, ContratoOutDTO contrato) implements Serializable {

    public static ProcessoOutDTO fromEntity(Processo processo){
        return new ProcessoOutDTO(processo.getId(), processo.getNumero(),  processo.getStatus(), processo.getObservacoes(), processo.getEstado(),
                ContratoOutDTO.fromEntity(processo.getContrato()));
    }
}