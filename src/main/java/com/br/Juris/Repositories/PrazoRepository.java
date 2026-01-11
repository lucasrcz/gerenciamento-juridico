package com.br.Juris.Repositories;

import com.br.Juris.Entities.Prazo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PrazoRepository extends JpaRepository<Prazo, Long> {

    //TODO Futuramente colocar por usuário a pesquisa WHERE processo.usuario == usuario AND...
    @Query("SELECT p FROM Prazo p " +
            "WHERE p.dataVencimento BETWEEN :dataAtual AND :dataFinal " +
            "ORDER BY p.dataVencimento ASC")
    List<Prazo> buscarPrazosProximos(@Param("dataAtual") LocalDateTime dataAtual,
                                     @Param("dataFinal") LocalDateTime dataFinal);
}