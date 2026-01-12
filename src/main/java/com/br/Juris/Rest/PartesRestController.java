package com.br.Juris.Rest;

import com.br.Juris.Dtos.in.PartesInDTO;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Dtos.out.PartesOutDTO;
import com.br.Juris.Services.PartesService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/partes")
public class PartesRestController {

    @Resource
    PartesService partesService;

    @Operation(description = "Encontra a parte por ID")
    @GetMapping("/{id}")
    public ResponseEntity<PartesOutDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(partesService.getById(id));
    }

    @Operation(description = "Cadastro de Parte (com endereços)")
    @PostMapping
    public ResponseEntity<MessageOutDTO> save(
            @RequestBody @Valid PartesInDTO dto
    ) {
        return ResponseEntity.ok(partesService.create(dto));
    }

    @Operation(description = "Atualização de Parte (com endereços)")
    @PutMapping("/{id}")
    public ResponseEntity<MessageOutDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid PartesInDTO dto
    ) {
        return ResponseEntity.ok(partesService.update(id, dto));
    }

    @Operation(description = "Exclusão de Parte")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageOutDTO> delete(@PathVariable Long id) {
        return ResponseEntity.ok(partesService.delete(id));
    }

    @Operation(description = "Listagem páginada de Partes")
    @GetMapping
    public ResponseEntity<Page<PartesOutDTO>> listAll(
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC)
            Pageable pageable
    ) {
        return ResponseEntity.ok(partesService.listAllPageable(pageable));
    }
}

