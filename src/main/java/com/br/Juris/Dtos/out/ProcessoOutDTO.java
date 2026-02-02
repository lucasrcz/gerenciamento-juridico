import com.br.Juris.Enums.StatusProcesso;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link com.br.Juris.Entities.Processo}
 */
public record ProcessoOutDTO(Long id, String numero, StatusProcesso status, String observacoes,
                             EstadoBrasil estado, ContratoOutDTO contrato, List<AdvogadoProcessoOutDTO> advogadosIds, List<ParteProcessoOutDTO> partesIds, AdvogadoProcessoOutDTO advogadoResponsavelId) implements Serializable {

    public static ProcessoOutDTO fromEntity(Processo processo){
        ContratoOutDTO contratoOut = null;

        if (processo.getContrato() != null) {
            contratoOut = ContratoOutDTO.fromEntity(processo.getContrato());
        }
        List<AdvogadoProcessoOutDTO> advogadosIds = processo.getAdvogados().stream().map(a-> new AdvogadoProcessoOutDTO(a.getId().toString(),a.getNome(),a.getNumeroOAB(),a.getSeccional())).toList();
        List<ParteProcessoOutDTO> partesIds = processo.getProcessoPartes().stream().map(p-> new ParteProcessoOutDTO(p.getParte().getId(), p.getParte().getNome(),p.getParte().getDocumento(),p.getParte().getTipoPessoa().getDescricao())).toList();
        Advogado responsavel = processo.getAdvogadoResponsavel();
        return new ProcessoOutDTO(
                processo.getId(),
                processo.getNumero(),
                processo.getStatus(),
                processo.getObservacoes(),
                processo.getEstado(),
                contratoOut,
                advogadosIds,
                partesIds,
                new AdvogadoProcessoOutDTO(responsavel.getId().toString(),responsavel.getNome(),responsavel.getNumeroOAB(),responsavel.getSeccional()));
    }
}