package com.appunture.backend.controller;

import com.appunture.backend.dto.request.LoginRequest;
import com.appunture.backend.dto.request.RegisterRequest;
import com.appunture.backend.dto.request.UpdateProfileRequest;
import com.appunture.backend.dto.response.AuthResponse;
import com.appunture.backend.dto.response.UserProfileResponse;
import com.appunture.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Auth", description = "Authentication and user profile endpoints")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Creates a new user and returns JWT token")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates user and returns JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get profile", description = "Returns current authenticated user profile")
    public ResponseEntity<UserProfileResponse> profile(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(authService.getProfile(principal.getUsername()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update profile", description = "Updates name and profession of current user")
    public ResponseEntity<UserProfileResponse> update(@AuthenticationPrincipal UserDetails principal,
                                                      @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(principal.getUsername(), request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Generates a new JWT token")
    public ResponseEntity<AuthResponse> refresh(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(authService.refreshToken(principal.getUsername()));
    }
}
