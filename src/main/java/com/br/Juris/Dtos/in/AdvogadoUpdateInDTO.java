package com.br.Juris.Dtos.in;

import com.br.Juris.Enums.EstadoBrasil;
import com.br.Juris.Enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdvogadoUpdateInDTO(

        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 150, message = "O nome pode ter no máximo 150 caracteres")
        @Pattern(
                regexp = "^[A-Za-zÀ-ÿ ]+$",
                message = "O nome deve conter apenas letras e espaços"
        )
        String nome,

        @NotBlank(message = "A senha é obrigatória")
        @Size(
                min = 6,
                max = 15,
                message = "A senha deve ter entre 6 e 15 caracteres"
        )
        String senha,

        @NotNull(message = "O perfil do usuário é obrigatório")
        UserRole role,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @Size(max = 150, message = "O e-mail pode ter no máximo 150 caracteres")
        String email,

        @NotBlank(message = "O telefone é obrigatório")
        @Pattern(
                regexp = "^\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$",
                message = "Telefone inválido. Ex: (11) 91234-5678"
        )
        String telefone,

        @NotBlank(message = "O número da OAB é obrigatório")
        @Size(max = 10, message = "O número da OAB pode ter no máximo 10 caracteres")
        @Pattern(
                regexp = "\\d+",
                message = "O número da OAB deve conter apenas números"
        )
        String numeroOAB,

        @NotNull(message = "Seccional é obrigatória")
        EstadoBrasil seccional
) {

}
