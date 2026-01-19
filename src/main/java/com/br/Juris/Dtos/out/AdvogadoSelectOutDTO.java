package com.br.Juris.Dtos.out;

import com.br.Juris.Enums.UserRole;
import lombok.Data;

@Data
public class AdvogadoSelectOutDTO {

    private String id;
    private String nome;
    private String cpf;
    private UserRole role;

    public AdvogadoSelectOutDTO(String id, String nome, String cpf, UserRole role) {
        this.id = id;
        this.nome = nome;
        this.cpf  = cpf;
        this.role = role;
    }
}
