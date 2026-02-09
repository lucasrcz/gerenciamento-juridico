package com.br.Juris.Repositories;

import com.br.Juris.Dtos.in.ClientesSelectDTO;
import com.br.Juris.Entities.Partes;
import com.br.Juris.Enums.TipoPessoa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PartesRepository extends JpaRepository<Partes, Long> {

    @Query("""
    select new com.br.Juris.Dtos.in.ClientesSelectDTO(
        p.id,
        concat(
            p.nome,
            ' - ',
            case
                when p.tipoPessoa = 'FISICA' then concat('CPF ', p.documento)
                else concat('CNPJ ', p.documento)
            end
        )
    )
    from Partes p
    where lower(p.nome) like lower(concat('%', :q, '%'))
       or lower(p.documento) like lower(concat('%', :q, '%'))
    order by p.nome
""")
    List<ClientesSelectDTO> buscarParaSelect(@Param("q") String q);

    @Query("""
        SELECT DISTINCT p
        FROM Partes p
        LEFT JOIN p.endereco e
        WHERE (LOWER(p.nome) LIKE LOWER(CONCAT('%', :nome, '%')) OR :nome IS NULL)
          AND (LOWER(p.email) LIKE LOWER(CONCAT('%', :email, '%')) OR :email IS NULL)
          AND (:tipoPessoa IS NULL OR p.tipoPessoa = :tipoPessoa)
          AND (LOWER(p.documento) LIKE LOWER(CONCAT('%', :documento, '%')) OR :documento IS NULL)
          AND (:estado IS NULL OR LOWER(e.estado) = LOWER(:estado))
    """)
    Page<Partes> buscarComFiltros(
            @Param("nome") String nome,
            @Param("email") String email,
            @Param("estado") String estado,
            @Param("tipoPessoa") TipoPessoa tipoPessoa,
            @Param("documento") String documento,
            Pageable pageable
    );


}
