package com.appunture.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class LoggingEmailService implements EmailService {

    @Override
    public void sendVerificationEmail(String email, String verificationLink) {
        log.info("Simulando envio de email de verificação para {}", email);
        log.debug("Link de verificação gerado: {}", verificationLink);
    }
}
