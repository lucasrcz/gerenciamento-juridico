package com.br.Juris.Utils;

import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class FileUtils {

    /**
     * Valida se o arquivo:
     * - Não é nulo
     * - Não está vazio
     * - É um PDF válido (Content-Type + Magic Number)
     */
    public static void checkFile(MultipartFile file) {
        validateNotEmpty(file);
        validateContentType(file);
        validateMagicNumber(file);
    }

    /**
     * Verifica se o arquivo MultipartFile é vazio ou nulo.
     */
    public static void validateNotEmpty(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O arquivo enviado está vazio ou não foi anexado."
            );
        }
    }

    /**
     * Verifica se o Content-Type é application/pdf
     */
    private static void validateContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O arquivo não está no formato PDF."
            );
        }
    }

    /**
     * Verifica o magic number do arquivo (%PDF-)
     */
    private static void validateMagicNumber(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[5];
            if (is.read(header) != 5) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Arquivo inválido ou corrompido."
                );
            }

            String signature = new String(header, StandardCharsets.US_ASCII);
            if (!signature.equals("%PDF-")) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "O arquivo não é um PDF válido."
                );
            }

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Erro ao ler o arquivo.",
                    e
            );
        }
    }

}
