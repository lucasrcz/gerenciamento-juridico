package com.br.Juris.Dtos.in;

import com.br.Juris.Enums.EstadoBrasil;
import com.br.Juris.Enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.*;

public record AdvogadoRegisterInDTO(

        @NotBlank(message = "O nome do advogado é obrigatório")
        @Size(max = 150, message = "O nome pode ter no máximo 150 caracteres")
        @Pattern(
                regexp = "^[A-Za-zÀ-ÿ0-9 '.\\-]+$",
                message = "O nome deve conter apenas letras, números, espaços e caracteres como . ' -"
        )
        String nome,

        @NotBlank(message = "O CPF é obrigatório")
        @Pattern(
                regexp = "\\d{11}",
                message = "O CPF deve conter exatamente 11 dígitos numéricos"
        )
        String login,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @Size(max = 150, message = "O e-mail pode ter no máximo 150 caracteres")
        String email,

        @NotBlank(message = "O telefone é obrigatório")
        @Pattern(
                regexp = "^[0-9]{10,11}$",
                message = "Telefone inválido. Use apenas números (DDD + número). Ex: 11912345678"
        )
        String telefone,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 6, max = 30, message = "A senha deve ter entre 6 e 30 caracteres")
        String senha,

        @NotNull(message = "O perfil do usuário é obrigatório")
        UserRole role,

        @NotBlank(message = "O número da OAB é obrigatório")
        @Size(max = 10, message = "O número da OAB pode ter no máximo 10 caracteres")
        @Pattern(
                regexp = "\\d+",
                message = "O número da OAB deve conter apenas números"
        )
        String numeroOAB,

        @NotNull(message = "Seccional é obrigatório")
        EstadoBrasil seccional
) {
}