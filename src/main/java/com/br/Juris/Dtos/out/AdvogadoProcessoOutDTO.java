package com.br.Juris.Dtos.out;

import com.br.Juris.Enums.EstadoBrasil;

public record AdvogadoProcessoOutDTO(String id, String nome, String numeroOAB, EstadoBrasil estado) {
}
