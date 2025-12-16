package com.br.Juris.Services.security;

import com.br.Juris.Dtos.in.AdvogadoUpdateInDTO;
import com.br.Juris.Entities.Advogado;
import com.br.Juris.Repositories.AdvogadoRepository;
import com.br.Juris.infra.security.SecurityConfigurations;
import com.br.Juris.infra.security.SecurityFilter;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService implements UserDetailsService {

    @Resource
    AdvogadoRepository repository;

    @Resource
    SecurityConfigurations securityConfigurations;

    @Autowired
    PasswordEncoder passwordEncoder;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findAdvogadoByCpf(username);
    }

    public void save(Advogado user){
        this.repository.save(user);
    }

    @PreAuthorize("hasRole('ADMIN') or #cpf == authentication.cpf")
    public void atualizar(String cpf, AdvogadoUpdateInDTO dto) {

        Advogado advogado = repository.findAdvogadoByCpf(cpf);


        advogado.setNome(dto.nome());
        advogado.setSenha(passwordEncoder.encode(dto.senha()));
        advogado.setRole(dto.role());
        advogado.setNumeroOAB(dto.numeroOAB());
        advogado.setSeccional(dto.seccional().toUpperCase());

        repository.save(advogado);
    }
}
