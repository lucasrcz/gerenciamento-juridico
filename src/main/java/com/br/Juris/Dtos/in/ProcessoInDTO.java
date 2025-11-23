package com.br.Juris.Dtos.in;

import com.br.Juris.Entities.Contrato;
import com.br.Juris.Entities.Processo;
import com.br.Juris.Enums.StatusProcesso;
import com.br.Juris.Utils.FileUtils;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.Serializable;

/**
 * DTO for {@link com.br.Juris.Entities.Processo}
 */
public record ProcessoInDTO(
        @NotBlank(message = "Número do processo é obrigatório") String numero,
        @NotNull(message = "Status do processo é obrigatório") StatusProcesso status,
        @NotBlank(message = "Estado é obrigatório") String estado,
        String observacoes,
        MultipartFile contrato)
        implements Serializable {

    public static Processo toEntity(ProcessoInDTO dto) throws IOException {
        Processo entity = new Processo();
        entity.setNumero(dto.numero());
        entity.setStatus(dto.status());
        entity.setEstado(dto.estado());
        entity.setObservacoes(dto.observacoes());
        MultipartFile contrato = dto.contrato();
        if (contrato != null) {
            if (!FileUtils.isPdf(contrato)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Arquivo não está no formato PDF"
                );
            }

            // Só seta se for PDF válido
            Contrato contratoEntity = new Contrato();
            contratoEntity.setProcesso(entity);
            contratoEntity.setNome(contrato.getOriginalFilename());
            entity.setContrato(contratoEntity);
        }
        return entity;
    }
}