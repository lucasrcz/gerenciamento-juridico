package com.br.Juris.Services;

import com.br.Juris.Dtos.in.PrazoInDTO;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Dtos.out.PrazosOutDTO;
import com.br.Juris.Entities.Prazo;
import com.br.Juris.Entities.Processo;
import com.br.Juris.Repositories.PrazoRepository;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PrazosService {

    @Resource
    private PrazoRepository repository;

    @Resource
    private ProcessosService processosService;

    public List<PrazosOutDTO> getPrazosList() {
        LocalDateTime dataAtual = LocalDate.now().atStartOfDay();
        LocalDateTime dataFinal = dataAtual.plusDays(15);
        List<Prazo> prazos = repository.buscarPrazosProximos(dataAtual,dataFinal);
        return prazos.stream().map(PrazosOutDTO::fromEntity).toList();
    }

    @Transactional
    public MessageOutDTO createPrazo(PrazoInDTO dto) {
        Processo processo = processosService.findById(dto.idProcesso());
        Prazo entity = PrazoInDTO.toEntity(dto,processo);
        entity = repository.save(entity);
        return new MessageOutDTO(entity.getId(),
                String.format("Prazo do processo de Nº %s inserido com sucesso",entity.getProcesso().getNumero()));
    }

    @Transactional
    public MessageOutDTO updatePrazo(PrazoInDTO dto, Long id) {
        Prazo prazo = findById(id);
        prazo.setDataVencimento(dto.dataVencimento());
        prazo.setDescricao(dto.descricao().isBlank() ? null : dto.descricao());
        repository.save(prazo);
        return new MessageOutDTO(prazo.getId(),"Prazo atualizado com sucesso");
    }

    public Prazo findById(Long id){
        return repository.findById(id).orElseThrow(()-> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Prazo não encontrado"));
    }

    @Transactional
    public MessageOutDTO deletePrazo(Long id) {
        Prazo prazo = findById(id);
        repository.delete(prazo);
        return new MessageOutDTO(id,"Prazo deletado com sucesso");
    }
}
