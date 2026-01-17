package com.br.Juris.Dtos.out;

import com.br.Juris.Entities.Advogado;
import com.br.Juris.Enums.EstadoBrasil;
import com.br.Juris.Enums.UserRole;

public record AdvogadoOutDTO(
        String id,
        String cpf,
        String nome,
        String email,
        String telefone,
        String numeroOAB,
        EstadoBrasil seccional,
        UserRole role,
        Boolean ativo
) {

    public static AdvogadoOutDTO fromEntity(Advogado advogado) {
        return new AdvogadoOutDTO(
                advogado.getId(),
                advogado.getCpf(),
                advogado.getNome(),
                advogado.getEmail(),
                advogado.getTelefone(),
                advogado.getNumeroOAB(),
                advogado.getSeccional(),
                advogado.getRole(),
                advogado.getAtivo()
        );
    }
}

