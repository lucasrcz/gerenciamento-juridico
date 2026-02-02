package com.br.Juris.Entities;

import com.br.Juris.Enums.TipoParte;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "processo_partes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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
    @Column(name = "tipo_parte")
    private TipoParte tipoParte;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProcessoParte)) return false;
        ProcessoParte that = (ProcessoParte) o;
        return processo != null && processo.equals(that.processo) &&
               parte != null && parte.equals(that.parte);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
