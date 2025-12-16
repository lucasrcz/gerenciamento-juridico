package com.br.Juris.Services.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.br.Juris.Entities.Advogado;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    @Value("${api.security.token.value}")
    private String secret;

    //TODO uma estrutura de secret melhor
    public String generateToken(Advogado user) {
        try{
            Algorithm algorithm = Algorithm.HMAC256(secret.getBytes());
            return JWT.create().withIssuer("Juris-API")
                    .withSubject(user.getUsername())
                    .withExpiresAt(this.generateExpirationDate())
                    .sign(algorithm);
        }catch(JWTCreationException e){
             throw new RuntimeException("Erro ao gerar token", e);
        }
    }

    public String validateToken(String token) {
        try{
            return JWT.require(Algorithm.HMAC256(secret.getBytes()))
                .withIssuer("Juris-API")
                .build()
                .verify(token)
                .getSubject();
        }catch (JWTVerificationException e){
            return "";
        }
    }

    //Expira a cada 12 Horas
    private Instant generateExpirationDate() {
        return LocalDateTime.now().plusHours(12).toInstant(ZoneOffset.of("-03:00"));
    }
}
