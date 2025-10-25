package com.appunture.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserProfileResponse {
    private String id;
    private String email;
    private String name;
    private String role;
    private boolean enabled;
    private String profileImageUrl;
    private String phoneNumber;
    private boolean emailVerified;
    private LocalDateTime createdAt;
    private List<String> favoritePointIds;
}
