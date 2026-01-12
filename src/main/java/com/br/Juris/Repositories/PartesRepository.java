package com.br.Juris.Repositories;

import com.br.Juris.Dtos.in.ClientesSelectDTO;
import com.br.Juris.Entities.Partes;
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
    order by p.nome
    """)
    List<ClientesSelectDTO> buscarParaSelect(@Param("q") String q);

}
