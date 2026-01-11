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
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "arquivo", nullable = false)
    private byte[] arquivo;

    @CreationTimestamp
    @Column(nullable = false,updatable = false,name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "formato_arquivo")
    private String formatoArquivo;

    @ManyToOne
    @JoinColumn(name = "processo_id")
    private Processo processo;

    @Column(name = "descricao")
    private String descricao;

    public Documento(String nome, byte[] arquivo, String formatoArquivo, String descricao, Processo processo) {
        this.nome = nome;
        this.arquivo = arquivo;
        this.formatoArquivo = formatoArquivo;
        this.descricao = descricao;
        this.processo = processo;
    }

    public Documento() {

    }
}
