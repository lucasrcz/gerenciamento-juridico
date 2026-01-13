package com.br.Juris.Dtos.in;

import com.br.Juris.Entities.Endereco;
import com.br.Juris.Entities.Partes;
import com.br.Juris.Enums.TipoPessoa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.util.List;

public record PartesInDTO(
        @NotBlank String nome,
        @NotNull TipoPessoa tipoPessoa,
        String documento,
        String email,
        String telefone,
        String observacoes,
        List<EnderecoInDTO> enderecos
) implements Serializable {

    public static Partes toEntity(PartesInDTO dto) {
        Partes parte = new Partes();
        parte.setNome(dto.nome());
        parte.setTipoPessoa(dto.tipoPessoa());
        parte.setDocumento(dto.documento());
        parte.setEmail(dto.email());
        parte.setTelefone(dto.telefone());
        parte.setObservacoes(dto.observacoes());

        if (dto.enderecos() != null) {
            dto.enderecos().forEach(e -> {
                Endereco endereco = new Endereco();
                endereco.setParte(parte);
                endereco.setLogradouro(e.logradouro());
                endereco.setNumero(e.numero());
                endereco.setComplemento(e.complemento());
                endereco.setBairro(e.bairro());
                endereco.setCidade(e.cidade());
                endereco.setEstado(e.estado());
                endereco.setCep(e.cep());
                parte.getEnderecos().add(endereco);
            });
        }

        return parte;
    }
}
