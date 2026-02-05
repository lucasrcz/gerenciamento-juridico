package com.br.Juris.Repositories;

import com.br.Juris.Entities.Processo;
import com.br.Juris.Enums.EstadoBrasil;
import com.br.Juris.Enums.StatusProcesso;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ProcessoRepository extends JpaRepository<Processo, Long> {

    // Usando DISTINCT e subqueries para evitar duplicação
    @Query("""
        SELECT DISTINCT p FROM Processo p
        WHERE (:numero IS NULL OR LOWER(p.numero) LIKE LOWER(CONCAT('%', :numero, '%')))
          AND (:status IS NULL OR p.status = :status)
          AND (:estado IS NULL OR p.estado = :estado)
          AND (:advogadoId IS NULL OR p.advogadoResponsavel.id = :advogadoId)
          AND (:advogadosIds IS NULL OR EXISTS (
              SELECT 1 FROM p.advogados a WHERE a.id IN :advogadosIds
          ))
          AND (:partesIds IS NULL OR EXISTS (
              SELECT 1 FROM p.processoPartes pp WHERE pp.parte.id IN :partesIds
          ))
        ORDER BY p.id DESC
    """)
    Page<Processo> buscarComFiltros(
            @Param("numero") String numero,
            @Param("status") StatusProcesso status,
            @Param("estado") EstadoBrasil estado,
            @Param("advogadoId") UUID advogadoId,
            @Param("advogadosIds") List<UUID> advogadosIds,
            @Param("partesIds") List<Long> partesIds,
            Pageable pageable
    );
}