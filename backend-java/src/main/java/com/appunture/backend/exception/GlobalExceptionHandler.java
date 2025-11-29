package com.appunture.backend.exception;

import com.appunture.backend.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Global exception handler for the application.
 * Provides consistent error response format across all endpoints.
 * 
 * Error codes:
 * - VALIDATION_ERROR (400): Input validation failed
 * - UNAUTHORIZED (401): Authentication required or failed
 * - FORBIDDEN (403): Access denied
 * - NOT_FOUND (404): Resource not found
 * - RATE_LIMIT_EXCEEDED (429): Too many requests
 * - INTERNAL_ERROR (500): Unexpected server error
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handles Jakarta Bean Validation errors from @Valid annotations
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        
        List<ErrorResponse.FieldError> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> ErrorResponse.FieldError.builder()
                        .field(fe.getField())
                        .message(fe.getDefaultMessage())
                        .rejectedValue(fe.getRejectedValue())
                        .build())
                .collect(Collectors.toList());

        ErrorResponse errorResponse = ErrorResponse.ofValidation(
                "Validation failed for one or more fields",
                fieldErrors
        );
        errorResponse.setPath(request.getRequestURI());

        log.debug("Validation error on {}: {}", request.getRequestURI(), fieldErrors);
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handles custom validation exceptions from business logic
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            ValidationException ex,
            HttpServletRequest request) {
        
        ErrorResponse.FieldError fieldError = ErrorResponse.FieldError.builder()
                .field(ex.getField())
                .message(ex.getMessage())
                .rejectedValue(ex.getRejectedValue())
                .build();

        ErrorResponse errorResponse = ErrorResponse.ofValidation(
                ex.getMessage(),
                ex.getField() != null ? List.of(fieldError) : null
        );
        errorResponse.setPath(request.getRequestURI());

        log.debug("Business validation error: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handles missing request parameters
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParameter(
            MissingServletRequestParameterException ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "VALIDATION_ERROR",
                String.format("Required parameter '%s' is missing", ex.getParameterName()),
                HttpStatus.BAD_REQUEST.value()
        );
        errorResponse.setPath(request.getRequestURI());

        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handles type mismatch errors (e.g., passing string when number expected)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "VALIDATION_ERROR",
                String.format("Parameter '%s' has invalid type", ex.getName()),
                HttpStatus.BAD_REQUEST.value()
        );
        errorResponse.setPath(request.getRequestURI());

        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handles authentication failures
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "UNAUTHORIZED",
                "Invalid credentials",
                HttpStatus.UNAUTHORIZED.value()
        );
        errorResponse.setPath(request.getRequestURI());

        log.debug("Authentication failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Handles general authentication exceptions
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(
            AuthenticationException ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "UNAUTHORIZED",
                "Authentication required",
                HttpStatus.UNAUTHORIZED.value()
        );
        errorResponse.setPath(request.getRequestURI());

        log.debug("Authentication required: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Handles access denied (authorization) errors
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "FORBIDDEN",
                "Access denied",
                HttpStatus.FORBIDDEN.value()
        );
        errorResponse.setPath(request.getRequestURI());

        log.warn("Access denied to {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    /**
     * Handles resource not found exceptions
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "NOT_FOUND",
                ex.getMessage(),
                HttpStatus.NOT_FOUND.value()
        );
        errorResponse.setPath(request.getRequestURI());

        log.debug("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Handles legacy IllegalArgumentException for backwards compatibility
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "BAD_REQUEST",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST.value()
        );
        errorResponse.setPath(request.getRequestURI());

        log.debug("Bad request: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handles rate limiting
     */
    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleRateLimitExceeded(
            RateLimitExceededException ex,
            HttpServletRequest request) {
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "RATE_LIMIT_EXCEEDED",
                ex.getMessage(),
                HttpStatus.TOO_MANY_REQUESTS.value()
        );
        errorResponse.setPath(request.getRequestURI());

        log.warn("Rate limit exceeded for {}", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(errorResponse);
    }

    /**
     * Handles all unexpected exceptions
     * Never expose stack traces in production
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(
            Exception ex,
            HttpServletRequest request) {
        
        String traceId = UUID.randomUUID().toString().substring(0, 8);
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "INTERNAL_ERROR",
                "An unexpected error occurred. Please try again later.",
                HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        errorResponse.setPath(request.getRequestURI());
        errorResponse.setTraceId(traceId);

        log.error("Unexpected error [traceId={}] on {}: {}", 
                traceId, request.getRequestURI(), ex.getMessage(), ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
