package com.br.Juris.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "prazos")
@Getter
@Setter
public class Prazo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_vencimento",nullable = false)
    private LocalDateTime dataVencimento;

    @Column(name = "descricao", length = 255)
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "processo_id")
    private Processo processo;

    public long getDiasRestantes() {
        if (this.dataVencimento == null) return 0;

        return ChronoUnit.DAYS.between(
                LocalDate.now(),
                this.dataVencimento.toLocalDate()
        );
    }

}
