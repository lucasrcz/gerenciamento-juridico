package com.br.Juris;

import com.br.Juris.Entities.Advogado;
import com.br.Juris.Enums.UserRole;
import com.br.Juris.Repositories.AdvogadoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class JurisApplication {

	public static void main(String[] args) {
		SpringApplication.run(JurisApplication.class, args);
	}
}
