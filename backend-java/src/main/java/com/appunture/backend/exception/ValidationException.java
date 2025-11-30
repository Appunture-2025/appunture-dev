package com.appunture.backend.exception;

/**
 * Exception thrown when business validation fails.
 * Maps to HTTP 400 Bad Request.
 */
public class ValidationException extends RuntimeException {

    private final String field;
    private final Object rejectedValue;

    public ValidationException(String message) {
        super(message);
        this.field = null;
        this.rejectedValue = null;
    }

    public ValidationException(String field, String message) {
        super(message);
        this.field = field;
        this.rejectedValue = null;
    }

    public ValidationException(String field, String message, Object rejectedValue) {
        super(message);
        this.field = field;
        this.rejectedValue = rejectedValue;
    }

    public String getField() {
        return field;
    }

    public Object getRejectedValue() {
        return rejectedValue;
    }
}
