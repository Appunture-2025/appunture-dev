package com.appunture.backend.dto.point;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "PointImageRemovalRequest", description = "Payload para remoção de imagem e auditoria de ponto")
public class PointImageRemovalRequest {

    @NotBlank
    @Schema(description = "URL original da imagem que será removida", example = "https://storage.googleapis.com/appunture/points/vg20/raw.jpg")
    private String imageUrl;

    @Schema(description = "Motivo ou anotação para auditoria", example = "Imagem duplicada/baixa qualidade")
    private String reason;
}
