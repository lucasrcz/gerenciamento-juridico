package com.br.Juris.Dtos.out;

import com.br.Juris.Entities.Processo;
import com.br.Juris.Enums.EstadoBrasil;
import com.br.Juris.Enums.StatusProcesso;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link com.br.Juris.Entities.Processo}
 */
public record ProcessoOutDTO(Long id, String numero, StatusProcesso status, String observacoes,
                             EstadoBrasil estado, ContratoOutDTO contrato, List<String> advogadosIds, List<Long> partesIds,String advogadoResponsavelId) implements Serializable {

    public static ProcessoOutDTO fromEntity(Processo processo){
        ContratoOutDTO contratoOut = null;

        if (processo.getContrato() != null) {
            contratoOut = ContratoOutDTO.fromEntity(processo.getContrato());
        }
        List<String> advogadosIds = processo.getAdvogados().stream().map(a-> a.getCpf()).toList();
        List<Long> partesIds = processo.getProcessoPartes().stream().map(p-> p.getParte().getId()).toList();
        return new ProcessoOutDTO(
                processo.getId(),
                processo.getNumero(),
                processo.getStatus(),
                processo.getObservacoes(),
                processo.getEstado(),
                contratoOut,
                advogadosIds,
                partesIds,
                processo.getAdvogadoResponsavel().getId().toString());
    }
}
