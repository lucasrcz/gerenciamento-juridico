package com.br.Juris.Dtos.in;

import com.br.Juris.Entities.Endereco;
import com.br.Juris.Entities.Partes;
import jakarta.validation.constraints.NotBlank;

import java.io.Serializable;

public record EnderecoInDTO(
        @NotBlank(message = "Logradouro é obrigatório") String logradouro,
        String numero,
        String complemento,
        String bairro,
        @NotBlank(message = "Cidade é obrigatória") String cidade,
        @NotBlank(message = "Estado é obrigatório") String estado,
        String cep
) implements Serializable {
}
