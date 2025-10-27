package com.br.Juris.Dtos.out;

import com.br.Juris.Entities.Processo;
import com.br.Juris.Enums.StatusProcesso;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

/**
 * DTO for {@link com.br.Juris.Entities.Processo}
 */
public record ProcessoOutDto(Long id, String numero, StatusProcesso status, String observacoes,
                             String estado) implements Serializable {

    public static ProcessoOutDto fromEntity(Processo processo){
        return new ProcessoOutDto(processo.getId(), processo.getNumero(),  processo.getStatus(), processo.getObservacoes(), processo.getEstado());
    }
}