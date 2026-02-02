package com.br.Juris.Entities;

import com.br.Juris.Enums.EstadoBrasil;
import com.br.Juris.Enums.StatusProcesso;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "processos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Processo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 25, nullable = false, unique = true, name = "numero")
    private String numero;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    private StatusProcesso status;

    @Column(name = "observacoes", columnDefinition = "text")
    private String observacoes;

    @Enumerated(EnumType.STRING)
    @Column(length = 2, nullable = false, name = "estado")
    private EstadoBrasil estado;

    @OneToOne(mappedBy = "processo", cascade = CascadeType.ALL, orphanRemoval = true)
    private Contrato contrato;

    @OneToMany(mappedBy = "processo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Documento> documentos = new ArrayList<>();

    @OneToMany(mappedBy = "processo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Prazo> prazos = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advogado_responsavel_id", nullable = false)
    private Advogado advogadoResponsavel;

    @ManyToMany
    @JoinTable(
            name = "processo_advogado",
            joinColumns = @JoinColumn(name = "processo_id"),
            inverseJoinColumns = @JoinColumn(name = "advogado_id")
    )
    private List<Advogado> advogados = new ArrayList<>();

    @OneToMany(
            mappedBy = "processo",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ProcessoParte> processoPartes = new ArrayList<>();
}
