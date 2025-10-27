package com.br.Juris.Rest;

import com.br.Juris.Dtos.in.ProcessoInDto;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Dtos.out.ProcessoOutDto;
import com.br.Juris.Services.ProcessosService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("proecssos")
public class ProcessosRestController {

    @Resource
    ProcessosService processosService;

    @Operation(description = "Encontra o processo por sua ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProcessoOutDto> getById(@PathVariable Long id){
        return ResponseEntity.ok(processosService.getById(id));
    }

    @Operation(description = "Cadastro de Processo")
    @PostMapping
    public ResponseEntity<MessageOutDTO> save(@RequestBody ProcessoInDto processo) throws IOException {
        return ResponseEntity.ok(processosService.create(processo));
    }

    @Operation(description = "Exclusão de processo")
    @DeleteMapping("{id}")
    public ResponseEntity<MessageOutDTO> delete(@PathVariable Long id){
        return ResponseEntity.ok(processosService.delete(id));
    }
}
