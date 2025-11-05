package com.appunture.backend.service;

public interface EmailService {
    void sendVerificationEmail(String email, String verificationLink);
}
