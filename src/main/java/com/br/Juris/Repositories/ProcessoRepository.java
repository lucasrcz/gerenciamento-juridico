package com.br.Juris.Repositories;

import com.br.Juris.Entities.Processo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcessoRepository extends JpaRepository<Processo, Long> {
}