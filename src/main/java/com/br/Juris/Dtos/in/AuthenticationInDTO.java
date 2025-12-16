package com.br.Juris.Dtos.in;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AuthenticationInDTO(

        @NotBlank(message = "O CPF é obrigatório")
        String login,

        @NotBlank(message = "A senha é obrigatória")
        String senha
) {
}
