package com.br.Juris.Utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

public class FileUtils {

    private static final String PDF_MAGIC = "%PDF-";

        /**
         * Verifica se o arquivo é PDF.
         * @param file MultipartFile enviado pelo usuário
         * @return true se for PDF, false caso contrário
         */
        public static boolean isPdf(MultipartFile file) {
            if (file == null || file.isEmpty()) {
                return false;
            }

            //Verifica content type (opcional, rápido)
            String contentType = file.getContentType();
            if (contentType != null && contentType.equalsIgnoreCase("application/pdf")) {
                return true;
            }

            //Verifica magic number no início do arquivo
            try (InputStream is = file.getInputStream()) {
                byte[] header = new byte[5]; // "%PDF-" tem 5 bytes
                if (is.read(header) != 5) {
                    return false;
                }
                String headerStr = new String(header);
                return PDF_MAGIC.equals(headerStr);
            } catch (IOException e) {
                return false;
            }
        }
}
