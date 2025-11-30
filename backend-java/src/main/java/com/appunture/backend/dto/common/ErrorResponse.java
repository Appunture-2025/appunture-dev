package com.appunture.backend.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

/**
 * Standard error response DTO for consistent API error handling.
 * Matches the OpenAPI specification format.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Standard error response wrapper")
public class ErrorResponse {

    @Schema(description = "Error details")
    private ErrorDetails error;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Error details object")
    public static class ErrorDetails {
        
        @Schema(description = "Error code", example = "RESOURCE_NOT_FOUND")
        private String code;
        
        @Schema(description = "Human-readable error message", example = "Point with id 'xyz' not found")
        private String message;
        
        @Schema(description = "ISO 8601 timestamp", example = "2025-11-28T10:00:00Z")
        private Instant timestamp;
        
        @Schema(description = "Request path that caused the error", example = "/api/points/xyz")
        private String path;
    }

    /**
     * Create an error response with the given parameters.
     */
    public static ErrorResponse of(String code, String message, String path) {
        return ErrorResponse.builder()
                .error(ErrorDetails.builder()
                        .code(code)
                        .message(message)
                        .timestamp(Instant.now())
                        .path(path)
                        .build())
                .build();
    }

    /**
     * Create a simple error response with just code and message.
     */
    public static ErrorResponse of(String code, String message) {
        return ErrorResponse.builder()
                .error(ErrorDetails.builder()
                        .code(code)
                        .message(message)
                        .timestamp(Instant.now())
                        .build())
                .build();
    }
}
