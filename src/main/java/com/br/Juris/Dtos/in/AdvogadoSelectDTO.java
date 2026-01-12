package com.br.Juris.Dtos.in;

import lombok.Data;

@Data
public class AdvogadoSelectDTO {

    private Long id;
    private String nome;

    public AdvogadoSelectDTO(Long id, String nome) {
        this.id = id;
        this.nome = nome;
    }
}
