package com.appunture.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for updating user profile
 */
@Getter
@Setter
public class UpdateProfileRequest {
    
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;
    
    @Size(max = 100, message = "Profession must be at most 100 characters")
    private String profession;
}
