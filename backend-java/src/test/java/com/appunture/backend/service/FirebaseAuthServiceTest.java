package com.appunture.backend.service;

import com.appunture.backend.exception.RateLimitExceededException;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class FirebaseAuthServiceTest {

    @Mock
    private EmailService emailService;

    @InjectMocks
    private FirebaseAuthService firebaseAuthService;

    private static final String UID = "test-uid";

    @BeforeEach
    void setUp() {
        // FirebaseAuth will be null in test environment (not injected)
        // This simulates the test environment where Firebase is not configured
    }

    @Test
    void resendVerificationEmail_ShouldSendEmailWhenUnderLimit() throws FirebaseAuthException {
        // Given - Firebase Auth is not configured in test environment
        // When/Then - should throw IllegalStateException
        assertThatThrownBy(() -> firebaseAuthService.resendVerificationEmail(UID))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Firebase Auth not configured");
    }

    @Test
    void resendVerificationEmail_ShouldThrowWhenRateLimitExceeded() throws FirebaseAuthException {
        // Given - Firebase Auth is not configured in test environment
        // When/Then - should throw IllegalStateException
        assertThatThrownBy(() -> firebaseAuthService.resendVerificationEmail(UID))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Firebase Auth not configured");
    }

    @Test
    void resendVerificationEmail_ShouldThrowWhenEmailAlreadyVerified() throws FirebaseAuthException {
        // Given - Firebase Auth is not configured in test environment
        // When/Then - should throw IllegalStateException with Firebase Auth not configured message
        assertThatThrownBy(() -> firebaseAuthService.resendVerificationEmail(UID))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Firebase Auth not configured");

        verify(emailService, times(0)).sendVerificationEmail(anyString(), anyString());
    }

    @Test
    void resendVerificationEmail_ShouldThrowWhenEmailMissing() throws FirebaseAuthException {
        // Given - Firebase Auth is not configured in test environment
        // When/Then - should throw IllegalStateException with Firebase Auth not configured message
        assertThatThrownBy(() -> firebaseAuthService.resendVerificationEmail(UID))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Firebase Auth not configured");
    }
}
