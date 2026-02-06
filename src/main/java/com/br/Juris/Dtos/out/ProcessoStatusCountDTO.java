package com.br.Juris.Dtos.out;

import com.br.Juris.Enums.StatusProcesso;

public record ProcessoStatusCountDTO(
        StatusProcesso status,
        Long quantidade
) {}
