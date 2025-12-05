package com.br.Juris.Repositories;

import com.br.Juris.Entities.Documento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    Page<Documento> findAllByProcesso_Id(long id, Pageable pageable);
}