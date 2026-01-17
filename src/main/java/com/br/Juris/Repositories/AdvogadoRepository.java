package com.br.Juris.Repositories;

import com.br.Juris.Dtos.out.AdvogadoSelectOutDTO;
import com.br.Juris.Entities.Advogado;
import com.br.Juris.Enums.EstadoBrasil;
import com.br.Juris.Enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdvogadoRepository extends JpaRepository<Advogado, String> {


   Advogado findAdvogadoByCpf(String cpf);

   List<Advogado> findAllByCpfIn(List<String> cpf);

   @Query("""
    select new com.br.Juris.Dtos.out.AdvogadoSelectOutDTO(
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
   List<AdvogadoSelectOutDTO> buscarAdvogadosParaSelect(@Param("q") String q);

   @Query("""
    SELECT a FROM Advogado a
    WHERE (:nome IS NULL OR LOWER(a.nome) LIKE LOWER(CONCAT('%', :nome, '%')))
      AND (:email IS NULL OR LOWER(a.email) LIKE LOWER(CONCAT('%', :email, '%')))
      AND (:role IS NULL OR a.role = :role)
      AND (:numeroOAB IS NULL OR a.numeroOAB = :numeroOAB)
      AND (:seccional IS NULL OR a.seccional = :seccional)
      AND (:ativo IS NULL OR a.ativo = :ativo)
""")
   Page<Advogado> filtrar(
           @Param("nome") String nome,
           @Param("email") String email,
           @Param("role") UserRole role,
           @Param("numeroOAB") String numeroOAB,
           @Param("seccional") EstadoBrasil seccional,
           @Param("ativo") Boolean ativo,
           Pageable pageable
   );


}