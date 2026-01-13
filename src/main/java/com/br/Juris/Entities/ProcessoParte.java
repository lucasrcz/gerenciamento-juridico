package com.br.Juris.Entities;

import com.br.Juris.Enums.TipoParte;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "processo_partes")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProcessoParte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processo_id", nullable = false)
    private Processo processo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parte_id", nullable = false)
    private Partes parte;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_parte", nullable = false)
    private TipoParte tipoParte;

    @Lob
    @Column(name = "observacoes")
    private String observacoes;

    public ProcessoParte(Processo processo,
                         Partes parte,
                         TipoParte tipoParte,
                         String observacoes) {
        this.processo = processo;
        this.parte = parte;
        this.tipoParte = tipoParte;
        this.observacoes = observacoes;
    }
}
