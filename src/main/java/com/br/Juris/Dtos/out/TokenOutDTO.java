package com.br.Juris.Dtos.out;

import com.br.Juris.Enums.UserRole;

public record TokenOutDTO(String token, String id, String cpf, UserRole role) {
}
