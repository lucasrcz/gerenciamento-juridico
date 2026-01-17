package com.br.Juris.Dtos.out;

import lombok.Data;

@Data
public class AdvogadoSelectOutDTO {

    private String id;
    private String nome;
    private String cpf;

    public AdvogadoSelectOutDTO(String id, String nome, String cpf) {
        this.id = id;
        this.nome = nome;
        this.cpf  = cpf;
    }
}
