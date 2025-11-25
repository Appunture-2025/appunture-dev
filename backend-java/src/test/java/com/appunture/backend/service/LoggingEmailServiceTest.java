package com.appunture.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(OutputCaptureExtension.class)
class LoggingEmailServiceTest {

    private final LoggingEmailService service = new LoggingEmailService();

    @Test
    void sendVerificationEmailLogsHelpfulMessage(CapturedOutput output) {
        service.sendVerificationEmail("user@appunture.com", "https://verify/app");

        assertThat(output.getOut()).contains("user@appunture.com");
        assertThat(output.getOut()).contains("Simulando envio de email de verificação");
    }
}