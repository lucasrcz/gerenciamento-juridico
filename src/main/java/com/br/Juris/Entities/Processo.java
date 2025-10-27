package com.br.Juris.Entities;

import com.br.Juris.Enums.StatusProcesso;
import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "processos")
@Getter
@Setter
public class Processo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 25, nullable = false, unique = true, name = "numero")
    private String numero;

    @Column(length = 25, name = "status")
    private StatusProcesso status;

    @Lob
    @Column(name = "observacoes")
    private String observacoes;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "contrato")
    private byte[] contrato;

    @Column(length = 2, nullable = false , name = "estado")
    private String estado;

}
