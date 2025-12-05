package com.br.Juris.Rest;

import com.br.Juris.Dtos.in.DocumentoInDTO;
import com.br.Juris.Dtos.out.DocumentoOutDTO;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Entities.Documento;
import com.br.Juris.Services.DocumentoService;
import com.br.Juris.Utils.ProjectUtils;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/documentos")
public class DocumentosRestController {

    @Resource
    DocumentoService service;

    @Operation(description = "Retorna a lista paginada de documentos de um Processo específico")
    @GetMapping("list/{idProcesso}")
    public ResponseEntity<Page<DocumentoOutDTO>> getDocumentos(@PathVariable long idProcesso,
                                                               @PageableDefault(size = 10,sort = "dataCriacao",direction = Sort.Direction.ASC) Pageable pageable) {
        return  ResponseEntity.ok(service.listAllPageableByIdProcesso(idProcesso,pageable));
    }

    @Operation(description = "Retorna os bytes do arquivo para visualização de um documento")
    @GetMapping("/{id}/arquivo")
    public ResponseEntity<byte[]> getArquivo(@PathVariable Long id){
        Documento documento = service.findById(id);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "inline; filename=\"" + documento.getNome() + "\"")
                .body(documento.getArquivo());
    }

    @Operation(description = "Cria documentos e vincula a um processo específico")
    @PostMapping(value = "{idProcesso}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageOutDTO> createDocumentos(@RequestParam("arquivos") List<MultipartFile> arquivos,
                                                          @RequestParam("descricoes") List<String> descricoes,
                                                          @PathVariable Long idProcesso) {
        ProjectUtils.checkListFiles(arquivos,descricoes);
        List<DocumentoInDTO> dtos = DocumentoInDTO.fromList(arquivos,descricoes);
        return ResponseEntity.ok(service.createDocumentos(dtos,idProcesso));
    }

    @Operation(description = "Deleta em Batch dos documentos conforme os IDS enviados")
    @DeleteMapping
    public ResponseEntity<MessageOutDTO> deleteDocumentos(@RequestBody List<Long> ids){
        return ResponseEntity.ok(service.deleteBatch(ids));
    }

    @Operation(description = "Edição em Batch dos documentos conforme os IDS enviados")
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageOutDTO> editDocumentos(@RequestParam("ids") List<Long> ids,
                                                        @RequestParam("arquivos") List<MultipartFile> arquivos,
                                                        @RequestParam("descricoes")List<String> descricoes){
        ProjectUtils.checkListFiles(arquivos,descricoes);
        List<DocumentoInDTO> dtos = DocumentoInDTO.fromList(arquivos,descricoes);
        ProjectUtils.checkListFiles(dtos,ids);
        return ResponseEntity.ok(service.updateDocumento(ids,dtos));
    }





}
