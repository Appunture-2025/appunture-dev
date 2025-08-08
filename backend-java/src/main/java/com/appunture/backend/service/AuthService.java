package com.appunture.backend.service;

import com.appunture.backend.dto.request.LoginRequest;
import com.appunture.backend.dto.request.RegisterRequest;
import com.appunture.backend.dto.request.UpdateProfileRequest;
import com.appunture.backend.dto.response.AuthResponse;
import com.appunture.backend.dto.response.UserProfileResponse;
import com.appunture.backend.entity.User;
import com.appunture.backend.repository.UserRepository;
import com.appunture.backend.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .profession(request.getProfession())
                .role("ROLE_USER")
                .build();
        userRepository.save(user);
        String token = jwtTokenProvider.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
            String token = jwtTokenProvider.generateToken(user.getEmail());
            return AuthResponse.builder()
                    .token(token)
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole())
                    .build();
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid credentials");
        }
    }

    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return UserProfileResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .profession(user.getProfession())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setName(request.getName());
        user.setProfession(request.getProfession());
        return UserProfileResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .profession(user.getProfession())
                .role(user.getRole())
                .build();
    }

    public AuthResponse refreshToken(String currentEmail) {
        User user = userRepository.findByEmail(currentEmail).orElseThrow();
        String token = jwtTokenProvider.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }
}
