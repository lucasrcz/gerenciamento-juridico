package com.br.Juris.Repositories;

import com.br.Juris.Entities.Advogado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdvogadoRepository extends JpaRepository<Advogado, String> {


   Advogado findAdvogadoByCpf(String cpf);

   List<Advogado> findAllByCpfIn(List<String> cpf);

}