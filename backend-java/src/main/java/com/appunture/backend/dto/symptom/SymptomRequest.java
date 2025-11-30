package com.appunture.backend.dto.symptom;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for creating or updating a symptom
 */
@Getter
@Setter
public class SymptomRequest {
    
    @NotBlank(message = "Symptom name is required")
    @Size(max = 100, message = "Symptom name must be at most 100 characters")
    private String name;
    
    @Size(max = 50, message = "Category must be at most 50 characters")
    private String category;
    
    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;
}
