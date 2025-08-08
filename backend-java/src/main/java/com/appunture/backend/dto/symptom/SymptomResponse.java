package com.appunture.backend.dto.symptom;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SymptomResponse {
    private Long id;
    private String name;
    private String category;
    private String description;
}
