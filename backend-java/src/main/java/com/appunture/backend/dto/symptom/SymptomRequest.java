package com.appunture.backend.dto.symptom;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SymptomRequest {
    @NotBlank
    private String name;
    private String category;
    private String description;
}
