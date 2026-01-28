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


    @Query("""
    SELECT p
    FROM Processo p
    LEFT JOIN p.advogados a
    LEFT JOIN p.processoPartes pp
    LEFT JOIN pp.parte parte
    WHERE (LOWER(p.numero) LIKE LOWER(CONCAT('%', :numero, '%')) OR :numero IS NULL)
      AND (:status IS NULL OR p.status = :status)
      AND (:estado IS NULL OR p.estado = :estado)
      AND (:advogadoId IS NULL OR a.id = :advogadoId)
      AND (:advogadosIds IS NULL OR a.cpf IN :advogadosIds)
      AND (:partesIds IS NULL OR parte.id IN :partesIds)
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