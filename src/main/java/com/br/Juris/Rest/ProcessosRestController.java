package com.br.Juris.Rest;

import com.br.Juris.Dtos.in.ProcessoInDTO;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Dtos.out.ProcessoOutDTO;
import com.br.Juris.Enums.StatusProcesso;
import com.br.Juris.Services.ProcessosService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/processos")
public class ProcessosRestController {

    @Resource
    ProcessosService processosService;

    @Operation(description = "Encontra o processo por sua ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProcessoOutDTO> getById(@PathVariable Long id){
        return ResponseEntity.ok(processosService.getById(id));
    }

    @Operation(description = "Cadastro de Processo")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageOutDTO> save(@ModelAttribute ProcessoInDTO processo) throws IOException {
        return ResponseEntity.ok(processosService.create(processo));
    }

    @Operation(description = "Exclusão de processo")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageOutDTO> delete(@PathVariable Long id){
        return ResponseEntity.ok(processosService.delete(id));
    }

    @Operation(description = "Listagem páginada de processos com filtros")
    @GetMapping(value = "/list", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<ProcessoOutDTO>> listAll(
            @RequestParam(required = false) String numero,
            @RequestParam(required = false) StatusProcesso status,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Long advogadoId,
            @RequestParam(required = false) List<Long> advogadosIds,
            @RequestParam(required = false) List<Long> partesIds,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC)
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                processosService.listAllPageable(
                        numero,
                        status,
                        estado,
                        advogadoId,
                        advogadosIds,
                        partesIds,
                        pageable
                )
        );
    }


    @Operation(description = "Atualização de Processo")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageOutDTO> update(@PathVariable Long id, @ModelAttribute ProcessoInDTO processo) throws IOException {
        return ResponseEntity.ok(processosService.update(id, processo));
    }





}
