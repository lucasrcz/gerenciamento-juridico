package com.br.Juris.Repositories;

import com.br.Juris.Dtos.in.AdvogadoSelectDTO;
import com.br.Juris.Entities.Advogado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AdvogadoRepository extends JpaRepository<Advogado, String> {


   Advogado findAdvogadoByCpf(String cpf);

   List<Advogado> findAllByCpfIn(List<String> cpf);

   @Query("""
    select new com.br.Juris.Dtos.in.AdvogadoSelectDTO(
        u.id,
        concat(
            u.nome,
            ' - OAB ',
            u.numeroOAB,
            '/',
            u.seccional
        ),
        u.cpf
    )
    from Advogado u
    where lower(u.nome) like lower(concat('%', :q, '%'))
    order by u.nome
""")
   List<AdvogadoSelectDTO> buscarAdvogadosParaSelect(@Param("q") String q);

}