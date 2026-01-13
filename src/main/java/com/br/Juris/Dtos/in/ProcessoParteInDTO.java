package com.br.Juris.Dtos.in;

import com.br.Juris.Enums.TipoParte;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

public record ProcessoParteInDTO(

        @NotNull(message = "Parte é obrigatória")
        Long parteId,

        @NotNull(message = "Tipo da parte é obrigatório")
        TipoParte tipoParte,

        String observacoes

) implements Serializable {
}
