package com.br.Juris.Rest;

import com.br.Juris.Dtos.out.AdvogadoOutDTO;
import com.br.Juris.Dtos.out.AdvogadoSelectOutDTO;
import com.br.Juris.Dtos.in.AdvogadoUpdateInDTO;
import com.br.Juris.Dtos.in.AuthenticationInDTO;
import com.br.Juris.Dtos.in.AdvogadoRegisterInDTO;
import com.br.Juris.Dtos.out.MessageOutDTO;
import com.br.Juris.Dtos.out.TokenOutDTO;
import com.br.Juris.Entities.Advogado;
import com.br.Juris.Enums.EstadoBrasil;
import com.br.Juris.Enums.UserRole;
import com.br.Juris.Services.security.AuthorizationService;
import com.br.Juris.Services.security.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthenticationRestController {

    @Resource
    private AuthenticationManager authenticationManager;

    @Resource
    private AuthorizationService authorizationService;

    @Resource
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Operation(description = "Login do usuário(Advogado), retorna o Token")
    @PostMapping("/login")
    public ResponseEntity<TokenOutDTO> login(@RequestBody @Valid AuthenticationInDTO dto) {
        var userNamePassword = new UsernamePasswordAuthenticationToken(dto.login(),dto.senha());
        var auth = this.authenticationManager.authenticate(userNamePassword);
        Advogado advogado = (Advogado) auth.getPrincipal();
        var token = tokenService.generateToken(advogado);
        return ResponseEntity.ok(new TokenOutDTO(token,advogado.getId(), advogado.getCpf(), advogado.getRole()));
    }

    @Operation(description = "Endpoint de criação de usuário(advogado)")
    @PostMapping("/register")
    public ResponseEntity<AdvogadoSelectOutDTO> register(@RequestBody @Valid AdvogadoRegisterInDTO dto){
        if(authorizationService.loadUserByUsername(dto.login()) != null){
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format("CPF já está cadastrado na base", dto.login()));
        }
        String encryptPassword = passwordEncoder.encode(dto.senha());
        Advogado user = new Advogado(dto.login(),encryptPassword,dto.nome(),dto.email(),dto.telefone(),dto.numeroOAB(),dto.seccional(), dto.role());
        return ResponseEntity.ok(authorizationService.save(user));
    }

    @Operation(description = "Endpoint de edição")
    @PutMapping("/{cpf}")
    @PreAuthorize("hasRole('ADMIN') or #cpf == authentication.name")
    public ResponseEntity<AdvogadoSelectOutDTO> atualizar(
            @PathVariable String cpf,
            @RequestBody @Valid AdvogadoUpdateInDTO dto
    ) {
        authorizationService.atualizar(cpf, dto);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/advogados/select")
    public ResponseEntity<List<AdvogadoSelectOutDTO>> buscarAdvogadosParaSelect(@RequestParam("q") String q) {
        return ResponseEntity.ok(authorizationService.buscarParaSelect(q));
    }

    @Operation(description = "Buscar advogado por CPF")
    @GetMapping("/advogados/{id}")
    public ResponseEntity<AdvogadoOutDTO> findByCpf(@PathVariable String id) {
        return ResponseEntity.ok(
                authorizationService.findById(id)
        );
    }

    @Operation(description = "Listagem paginada de advogados com filtros")
    @GetMapping("/advogados")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AdvogadoOutDTO>> listarPaginado(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String numeroOAB,
            @RequestParam(required = false) EstadoBrasil seccional,
            @RequestParam(required = false) Boolean ativo,
            @PageableDefault(size = 10, sort = "nome") Pageable pageable
    ) {
        return ResponseEntity.ok(
                authorizationService.listarPaginado(
                        nome, email, role, numeroOAB, seccional, ativo, pageable
                )
        );
    }

    @Operation(description = "Exclusão lógica de advogado (somente ADMIN)")
    @DeleteMapping("/advogados/{cpf}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageOutDTO> deletarLogico(
            @PathVariable String cpf
    ) {
        authorizationService.deletarLogicoPorCpf(cpf);
        return ResponseEntity.ok(new MessageOutDTO(null,"Advogado de CPF Nº: %s desativado com sucesso".formatted(cpf)));
    }
}
