package com.appunture.backend.dto.point;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for creating or updating an acupuncture point
 */
@Getter
@Setter
public class PointRequest {
    
    @NotBlank(message = "Point code is required")
    @Size(max = 10, message = "Point code must be at most 10 characters")
    private String code;
    
    @NotBlank(message = "Point name is required")
    @Size(max = 100, message = "Point name must be at most 100 characters")
    private String name;
    
    @Size(max = 100, message = "Chinese name must be at most 100 characters")
    private String chineseName;
    
    @NotBlank(message = "Meridian is required")
    private String meridian;
    
    @NotBlank(message = "Location description is required")
    @Size(max = 500, message = "Location description must be at most 500 characters")
    private String location;
    
    @Size(max = 1000, message = "Indications must be at most 1000 characters")
    private String indications;
    
    @Size(max = 500, message = "Contraindications must be at most 500 characters")
    private String contraindications;
    
    private String coordinatesJson;
    
    private String imageUrl;
}
