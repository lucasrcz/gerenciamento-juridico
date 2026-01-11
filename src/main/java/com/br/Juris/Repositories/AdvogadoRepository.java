package com.br.Juris.Repositories;

import com.br.Juris.Entities.Advogado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdvogadoRepository extends JpaRepository<Advogado, Long> {


   Advogado findAdvogadoByCpf(String cpf);

}