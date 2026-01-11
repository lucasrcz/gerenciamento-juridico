package com.br.Juris.Rest;

import com.br.Juris.Dtos.in.PrazoInDTO;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Dtos.out.PrazosOutDTO;
import com.br.Juris.Services.PrazosService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/prazos")
@RestController
public class PrazosRestController {

    @Resource
    private PrazosService service;

    @Operation(description = "Retorna a lista de prazos que estão proximos de expirar dentro do sistema")
    @GetMapping("/list")
    public ResponseEntity<List<PrazosOutDTO>> getPrazos(){
        return ResponseEntity.ok(service.getPrazosList());
    }

    @Operation(description = "Cadastro de Prazo")
    @PostMapping
    public ResponseEntity<MessageOutDTO> createPrazo(@RequestBody PrazoInDTO prazo){
        return ResponseEntity.ok(service.createPrazo(prazo));
    }

    @Operation(description = "Edição de Prazo")
    @PutMapping("/{id}")
    public ResponseEntity<MessageOutDTO> updatePrazo(@PathVariable Long id,
                                                     @RequestBody PrazoInDTO prazo){
        return ResponseEntity.ok(service.updatePrazo(prazo,id));
    }

    @Operation(description = "Deleta prazo")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageOutDTO> deletePrazo(@PathVariable Long id){
        return ResponseEntity.ok(service.deletePrazo(id));
    }

}
