package com.br.Juris.Utils;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

public class ProjectUtils {

    public static void checkListFiles(List<?> list, List<?> secondList) {
        if(list.size() != secondList.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O tamanho das listas não é igual, erro."
            );
        }
    }
}
