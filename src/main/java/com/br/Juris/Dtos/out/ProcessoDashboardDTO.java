package com.br.Juris.Dtos.out;


import java.util.List;

public record ProcessoDashboardDTO(
        Long totalProcessos,
        List<ProcessoStatusCountDTO> porStatus
) {}
