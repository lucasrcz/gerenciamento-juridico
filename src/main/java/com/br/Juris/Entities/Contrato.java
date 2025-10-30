package com.br.Juris.Entities;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Entity
@Table(name = "processos_contratos")
@Getter
@Setter
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome",nullable = false)
    private String nome;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "dados", nullable = false)
    private byte[] dados;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processo_id", nullable = false, unique = true)
    private Processo processo;

    public void updateContrato(MultipartFile arquivo) throws IOException {
        this.nome = arquivo.getName();
        this.dados = arquivo.getBytes();
    }
}
