package com.br.Juris.Entities;

import com.br.Juris.Enums.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Table(name = "advogados", uniqueConstraints = {
                @UniqueConstraint(columnNames = {"numero_oab", "seccional"})})
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Advogado implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "cpf", length = 18, nullable = false, unique = true)
    private String cpf;

    @Column(name = "senha",length = 100)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private UserRole role;

    @Column(name = "numero_oab",nullable = false , length = 10)
    private String numeroOAB;

    @Column(name = "seccional" , length = 2, nullable = false)
    private String seccional;

    @Column(name = "nome", length = 150, nullable = false)
    private String nome;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if(this.role.equals(UserRole.ADMIN)){
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"),new SimpleGrantedAuthority("ROLE_USER"));
        }else{
            return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.cpf;
    }

    public Advogado(String cpf,
                    String senha,
                    String nome,
                    String numeroOAB,
                    String seccional,
                    UserRole role) {
        this.cpf = cpf;
        this.senha = senha;
        this.nome = nome;
        this.numeroOAB = numeroOAB;
        this.seccional = seccional;
        this.role = role;
    }
}
