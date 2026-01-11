package com.br.Juris.Rest;

import com.br.Juris.Dtos.in.AdvogadoUpdateInDTO;
import com.br.Juris.Dtos.in.AuthenticationInDTO;
import com.br.Juris.Dtos.in.RegisterInDTO;
import com.br.Juris.Dtos.out.TokenOutDTO;
import com.br.Juris.Entities.Advogado;
import com.br.Juris.Services.security.AuthorizationService;
import com.br.Juris.Services.security.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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
        var token = tokenService.generateToken((Advogado) auth.getPrincipal());
        return ResponseEntity.ok(new TokenOutDTO(token));
    }

    @Operation(description = "Endpoint de criação de usuário(advogado)")
    @PostMapping("/register")
    public ResponseEntity register(@RequestBody @Valid RegisterInDTO dto){
        if(authorizationService.loadUserByUsername(dto.login()) != null){
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format("CPF já está cadastrado na base", dto.login()));
        }
        String encryptPassword = passwordEncoder.encode(dto.senha());
        Advogado user = new Advogado(dto.login(),encryptPassword,dto.nome(),dto.numeroOAB(),dto.seccional(), dto.role());
        authorizationService.save(user);
        return ResponseEntity.ok().build();
    }

    @Operation(description = "Endpoint de edição")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #cpf == authentication.name")
    public ResponseEntity<Void> atualizar(
            @PathVariable String cpf,
            @RequestBody @Valid AdvogadoUpdateInDTO dto
    ) {
        authorizationService.atualizar(cpf, dto);
        return ResponseEntity.noContent().build();
    }

    //TODO implementar paginação de usuários e exclusão lógica
}
