package com.br.Juris.Dtos.out;

import com.br.Juris.Entities.Endereco;

public record EnderecoOutDTO(
        Long id,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        String cep
) {

    public static EnderecoOutDTO fromEntity(Endereco entity) {
        return new EnderecoOutDTO(
                entity.getId(),
                entity.getLogradouro(),
                entity.getNumero(),
                entity.getComplemento(),
                entity.getBairro(),
                entity.getCidade(),
                entity.getEstado(),
                entity.getCep()
        );
    }
}
