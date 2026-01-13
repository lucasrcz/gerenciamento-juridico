package com.br.Juris.Dtos.in;

import lombok.Data;

@Data
public class AdvogadoSelectDTO {

    private String id;
    private String nome;
    private String cpf;

    public AdvogadoSelectDTO(String id, String nome, String cpf) {
        this.id = cpf;
        this.nome = nome;
        this.cpf  = cpf;
    }
}
