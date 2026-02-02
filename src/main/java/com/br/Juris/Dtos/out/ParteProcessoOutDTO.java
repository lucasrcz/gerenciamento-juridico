package com.br.Juris.Dtos.out;

public record ParteProcessoOutDTO(
    Long id, 
    String nome, 
    String documento, 
    String tipoPessoa,
    String tipoParte
) {}
