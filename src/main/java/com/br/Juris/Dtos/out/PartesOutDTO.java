package com.br.Juris.Dtos.out;

import com.br.Juris.Entities.Partes;
import com.br.Juris.Enums.TipoPessoa;

import java.util.List;

public record PartesOutDTO(
        Long id,
        String nome,
        TipoPessoa tipoPessoa,
        String documento,
        String email,
        String telefone,
        String observacoes,
        List<EnderecoOutDTO> enderecos
) {

    public static PartesOutDTO fromEntity(Partes entity) {
        return new PartesOutDTO(
                entity.getId(),
                entity.getNome(),
                entity.getTipoPessoa(),
                entity.getDocumento(),
                entity.getEmail(),
                entity.getTelefone(),
                entity.getObservacoes(),
                entity.getEnderecos()
                        .stream()
                        .map(EnderecoOutDTO::fromEntity)
                        .toList()
        );
    }
}

