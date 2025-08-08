package com.appunture.backend.dto.point;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PointResponse {
    private Long id;
    private String code;
    private String name;
    private String chineseName;
    private String meridian;
    private String location;
    private String indications;
    private String contraindications;
    private String coordinatesJson;
    private String imageUrl;
}
