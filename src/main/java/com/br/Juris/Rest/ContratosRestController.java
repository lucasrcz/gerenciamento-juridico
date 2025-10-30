package com.br.Juris.Rest;

import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Entities.Contrato;
import com.br.Juris.Services.ContratosService;
import com.br.Juris.Utils.FileUtils;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/contratos")
public class ContratosRestController {

    @Resource
    private ContratosService contratosService;

    @Operation(description = "Retorna os bytes do arquivo para visualização")
    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getArquivo(@PathVariable Long id){
        Contrato contrato = contratosService.findById(id);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "inline; filename=\"" + contrato.getNome() + "\"")
                .body(contrato.getDados());
    }

    @Operation(description = "Deleta o contrato por sua ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageOutDTO> delete(@PathVariable Long id){
        return ResponseEntity.ok(contratosService.delete(id));
    }

    @Operation(description = "Atualiza o contrato por sua ID")
    @PutMapping(value = "{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageOutDTO> update(@PathVariable Long id,
                                                @RequestParam("arquivo") MultipartFile arquivo) throws IOException {
        FileUtils.validateNotEmpty(arquivo);
        return ResponseEntity.ok(contratosService.update(id,arquivo));
    }
}
