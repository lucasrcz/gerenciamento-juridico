package com.br.Juris.Repositories;

import com.br.Juris.Entities.Prazo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface PrazoRepository extends JpaRepository<Prazo, Long> {

    @Query("SELECT p FROM Prazo p " +
            "WHERE p.dataVencimento >= :dataAtual " +
            "ORDER BY p.dataVencimento ASC")
    List<Prazo> buscarPrazosNaoVencidos(@Param("dataAtual") LocalDate dataAtual);

    //TODO Futuramente colocar por usuário a pesquisa WHERE processo.usuario == usuario AND...
    @Query("SELECT p FROM Prazo p " +
            "WHERE p.dataVencimento BETWEEN :dataAtual AND :dataFinal " +
            "ORDER BY p.dataVencimento ASC")
    List<Prazo> buscarPrazosProximos(@Param("dataAtual") LocalDate dataAtual,
                                     @Param("dataFinal") LocalDate dataFinal);

    @Query("SELECT p FROM Prazo p " +
            "WHERE p.dataVencimento BETWEEN :dataAtual AND :dataFinal " +
            "AND p.processo.id = :idProcesso " +
            "ORDER BY p.dataVencimento ASC")
    List<Prazo> buscarPrazosProximosParaProcesso(@Param("dataAtual") LocalDate dataAtual,
                                     @Param("dataFinal") LocalDate dataFinal,
                                     @Param("idProcesso") Long idProcesso);
}