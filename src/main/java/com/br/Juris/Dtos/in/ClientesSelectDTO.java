package com.br.Juris.Dtos.in;

import lombok.Data;

@Data
public class ClientesSelectDTO {

    private Long id;

    private String nomeCpf;

    public ClientesSelectDTO(Long id,
                             String nomeCpf) {
        this.id = id;
        this.nomeCpf = nomeCpf;
    }
}
