package com.br.Juris.Dtos.in;

import lombok.Data;

@Data
public class AdvogadoSelectDTO {

    private String cpf;
    private String nome;

    public AdvogadoSelectDTO(String cpf, String nome) {
        this.cpf = cpf;
        this.nome = nome;
    }
}
