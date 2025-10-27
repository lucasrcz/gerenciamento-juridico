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
public record ProcessoInDto(
        @NotBlank(message = "Número do processo é obrigatório") String numero,
        @NotNull(message = "Status do processo é obrigatório") StatusProcesso status,
        @NotBlank(message = "Estado é obrigatório") String estado,
        MultipartFile contrato)
        implements Serializable {

    public static Processo toEntity(ProcessoInDto dto) throws IOException {
        Processo entity = new Processo();
        entity.setNumero(dto.numero());
        entity.setStatus(dto.status());
        entity.setEstado(dto.estado());

        MultipartFile contrato = dto.contrato();
        if (!FileUtils.isPdf(contrato)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Arquivo não está no formato PDF"
                );
        }
        Contrato contratoEntity = new Contrato();
        contratoEntity.setProcesso(entity);
        contratoEntity.setDados(contrato.getBytes());
        contratoEntity.setNome(contrato.getOriginalFilename());
        entity.setContrato(contratoEntity);
        return entity;
    }
}
