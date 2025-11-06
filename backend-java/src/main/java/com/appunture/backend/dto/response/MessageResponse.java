package com.appunture.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@Schema(description = "Resposta simples com mensagem para feedback de operações")
public class MessageResponse {
    @Schema(example = "Email de verificação reenviado. Verifique sua caixa de entrada.")
    private String message;
}
