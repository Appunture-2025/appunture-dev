package com.appunture.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Implementação padrão que apenas registra o envio do email. Pode ser substituída por uma
 * implementação real integrada a um provedor de email.
 */
@Service
@Slf4j
public class LoggingEmailService implements EmailService {

    @Override
    public void sendVerificationEmail(String email, String verificationLink) {
        log.info("Simulando envio de email de verificação para {}", email);
        log.debug("Link de verificação gerado: {}", verificationLink);
    }
}
