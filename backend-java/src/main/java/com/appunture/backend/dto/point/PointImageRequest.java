package com.appunture.backend.dto.point;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "PointImageRequest", description = "Payload para adicionar imagem ao ponto Firestore")
public class PointImageRequest {

    @NotBlank(message = "Image URL is required")
    @Pattern(
        regexp = "^https?://.*",
        message = "Image URL must be a valid HTTP or HTTPS URL"
    )
    @Schema(description = "URL original da imagem armazenada no Firebase Storage", example = "https://storage.googleapis.com/appunture/points/vg20/raw.jpg")
    private String imageUrl;

    @Schema(description = "URL do thumbnail gerado (opcional). Se ausente e generateThumbnail=true, o backend dispara a função de thumbnail.", example = "https://storage.googleapis.com/appunture/points/vg20/raw_320.jpg")
    private String thumbnailUrl;

    @Schema(description = "Quando verdadeiro, solicita ao backend que gere o thumbnail via Cloud Function", example = "true")
    private Boolean generateThumbnail = Boolean.TRUE;

    @Schema(description = "Notas de auditoria para identificar a origem do upload", example = "Upload realizado pelo app iOS 3.2")
    private String notes;
}
