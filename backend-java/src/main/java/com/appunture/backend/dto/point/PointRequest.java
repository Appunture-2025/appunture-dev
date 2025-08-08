package com.appunture.backend.dto.point;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PointRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String name;
    private String chineseName;
    @NotBlank
    private String meridian;
    @NotBlank
    private String location;
    private String indications;
    private String contraindications;
    private String coordinatesJson;
    private String imageUrl;
}
