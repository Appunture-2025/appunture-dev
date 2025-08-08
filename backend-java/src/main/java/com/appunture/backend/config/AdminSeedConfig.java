package com.appunture.backend.config;

import com.appunture.backend.entity.User;
import com.appunture.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeedConfig {

    private static final Logger log = LoggerFactory.getLogger(AdminSeedConfig.class);

    @Value("${app.admin-seed.email}")
    private String adminEmail;

    @Value("${app.admin-seed.password}")
    private String adminPassword;

    @Bean
    CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByEmail(adminEmail).ifPresentOrElse(u -> {
                if (!"ROLE_ADMIN".equals(u.getRole())) {
                    u.setRole("ROLE_ADMIN");
                    log.info("Updated existing user '{}' to ROLE_ADMIN", adminEmail);
                }
            }, () -> {
                User admin = User.builder()
                        .email(adminEmail)
                        .passwordHash(passwordEncoder.encode(adminPassword))
                        .name("Administrator")
                        .role("ROLE_ADMIN")
                        .build();
                userRepository.save(admin);
                log.info("Seeded admin user '{}'", adminEmail);
            });
        };
    }
}
