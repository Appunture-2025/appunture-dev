package com.appunture.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Standard error response format for API errors.
 * Provides consistent error structure across all endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    /**
     * Error code identifying the type of error
     * Examples: VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, INTERNAL_ERROR
     */
    private String code;

    /**
     * Human-readable error message
     */
    private String message;

    /**
     * HTTP status code
     */
    private int status;

    /**
     * ISO 8601 timestamp when the error occurred
     */
    private Instant timestamp;

    /**
     * Optional trace ID for debugging
     */
    private String traceId;

    /**
     * Optional path where the error occurred
     */
    private String path;

    /**
     * Validation error details for field-level errors
     */
    private List<FieldError> details;

    /**
     * Represents a field-level validation error
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String message;
        private Object rejectedValue;
    }

    /**
     * Creates a simple error response with just code and message
     */
    public static ErrorResponse of(String code, String message, int status) {
        return ErrorResponse.builder()
                .code(code)
                .message(message)
                .status(status)
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Creates an error response with field validation errors
     */
    public static ErrorResponse ofValidation(String message, List<FieldError> details) {
        return ErrorResponse.builder()
                .code("VALIDATION_ERROR")
                .message(message)
                .status(400)
                .timestamp(Instant.now())
                .details(details)
                .build();
    }
}
