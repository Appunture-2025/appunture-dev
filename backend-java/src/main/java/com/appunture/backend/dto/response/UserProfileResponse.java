package com.appunture.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private String email;
    private String name;
    private String profession;
    private String role;
}
