package com.br.Juris.Dtos.out;

import com.br.Juris.Entities.Advogado;
import com.br.Juris.Entities.Partes;
import com.br.Juris.Entities.Prazo;
import com.br.Juris.Entities.Processo;
import com.br.Juris.Enums.EstadoBrasil;
import com.br.Juris.Enums.StatusProcesso;

import java.io.Serializable;
import java.util.Comparator;
import java.util.List;

/**
 * DTO for {@link com.br.Juris.Entities.Processo}
 */
public record ProcessoOutDTO(Long id, String numero, StatusProcesso status, String observacoes,
                             EstadoBrasil estado, ContratoOutDTO contrato, List<AdvogadoProcessoOutDTO> advogadosIds,
                             List<ParteProcessoOutDTO> partesIds, AdvogadoProcessoOutDTO advogadoResponsavelId,PrazosOutDTO proximoPrazo) implements Serializable {

    public static ProcessoOutDTO fromEntity(Processo processo){
        ContratoOutDTO contratoOut = null;

        if (processo.getContrato() != null) {
            contratoOut = ContratoOutDTO.fromEntity(processo.getContrato());
        }
        List<AdvogadoProcessoOutDTO> advogadosIds = processo.getAdvogados().stream().map(a-> new AdvogadoProcessoOutDTO(a.getId().toString(),a.getNome(),a.getNumeroOAB(),a.getSeccional())).toList();
        List<ParteProcessoOutDTO> partesIds = processo.getProcessoPartes().stream().map(p-> new ParteProcessoOutDTO(p.getParte().getId(), p.getParte().getNome(),p.getParte().getDocumento(),p.getParte().getTipoPessoa().getDescricao())).toList();
        Advogado responsavel = processo.getAdvogadoResponsavel();

        PrazosOutDTO proximoPrazo = processo.getPrazos().stream()
                .filter(p -> p.getDiasRestantes() >= 0)
                .min(Comparator.comparing(Prazo::getDataVencimento))
                .map(PrazosOutDTO::fromEntity)
                .orElse(null);

        return new ProcessoOutDTO(
                processo.getId(),
                processo.getNumero(),
                processo.getStatus(),
                processo.getObservacoes(),
                processo.getEstado(),
                contratoOut,
                advogadosIds,
                partesIds,
                new AdvogadoProcessoOutDTO(responsavel.getId().toString(),
                        responsavel.getNome(),responsavel.getNumeroOAB(),
                        responsavel.getSeccional()),
                proximoPrazo);
    }
}
