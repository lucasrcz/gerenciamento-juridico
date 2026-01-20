package com.br.Juris.Services.security;

import com.br.Juris.Dtos.out.AdvogadoOutDTO;
import com.br.Juris.Dtos.out.AdvogadoSelectOutDTO;
import com.br.Juris.Dtos.in.AdvogadoUpdateInDTO;
import com.br.Juris.Entities.Advogado;
import com.br.Juris.Enums.EstadoBrasil;
import com.br.Juris.Enums.UserRole;
import com.br.Juris.Repositories.AdvogadoRepository;
import com.br.Juris.infra.security.SecurityConfigurations;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

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

    public AdvogadoSelectOutDTO save(Advogado user){
       Advogado saved =  this.repository.save(user);
       return new AdvogadoSelectOutDTO(saved.getId(), saved.getEmail(), saved.getCpf(),saved.getRole());
    }

    @PreAuthorize("hasRole('ADMIN') or #cpf == authentication.cpf")
    public AdvogadoSelectOutDTO atualizar(String id, AdvogadoUpdateInDTO dto) {

        Advogado advogado = findById(id);


        advogado.setNome(dto.nome());
        advogado.setSenha(passwordEncoder.encode(dto.senha()));
        advogado.setRole(dto.role());
        advogado.setNumeroOAB(dto.numeroOAB());
        advogado.setSeccional(dto.seccional());

        advogado = repository.save(advogado);
        return new AdvogadoSelectOutDTO(advogado.getId(), advogado.getEmail(), advogado.getCpf(),advogado.getRole());
    }

    public List<Advogado> findAllByCpf(List<String> cpfs){
        return repository.findAllByCpfIn(cpfs);
    }

    @Transactional(readOnly = true)
    public List<AdvogadoSelectOutDTO> buscarParaSelect(String query) {

        if (query == null || query.isBlank()) {
            return List.of();
        }

        return repository.buscarAdvogadosParaSelect(query.trim());
    }

    @Transactional(readOnly = true)
    public AdvogadoOutDTO findByIdAndReturnDTO(String id) {

        Advogado advogado = findById(id);

        return AdvogadoOutDTO.fromEntity(advogado);
    }

    @Transactional(readOnly = true)
    public Page<AdvogadoOutDTO> listarPaginado(
            String nome,
            String email,
            UserRole role,
            String numeroOAB,
            EstadoBrasil seccional,
            Boolean ativo,
            Pageable pageable
    ) {
        return repository.filtrar(
                nome,
                email,
                role,
                numeroOAB,
                seccional,
                ativo,
                pageable
        ).map(AdvogadoOutDTO::fromEntity);
    }


    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deletarLogicoPorId(String id) {

        Advogado advogado = this.findById(id);
        if (Boolean.FALSE.equals(advogado.getAtivo())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Advogado já está inativo"
            );
        }
        advogado.setAtivo(false);
        repository.save(advogado);
    }

    public Advogado findById(String id){
        return repository.findById(id).orElseThrow(()-> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Advogado não encontrado"));
    }
}
