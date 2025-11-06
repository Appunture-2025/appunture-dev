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
    private FirebaseAuth firebaseAuth;

    @Mock
    private EmailService emailService;

    @Mock
    private UserRecord userRecord;

    @InjectMocks
    private FirebaseAuthService firebaseAuthService;

    private static final String UID = "test-uid";
    private static final String EMAIL = "user@example.com";
    private static final String VERIFICATION_LINK = "https://example.com/verify";

    @BeforeEach
    void setUp() throws FirebaseAuthException {
        when(firebaseAuth.getUser(UID)).thenReturn(userRecord);
        when(userRecord.isEmailVerified()).thenReturn(false);
        when(userRecord.getEmail()).thenReturn(EMAIL);
        when(firebaseAuth.generateEmailVerificationLink(EMAIL)).thenReturn(VERIFICATION_LINK);
    }

    @Test
    void resendVerificationEmail_ShouldSendEmailWhenUnderLimit() throws FirebaseAuthException {
        firebaseAuthService.resendVerificationEmail(UID);

        verify(firebaseAuth).getUser(UID);
        verify(emailService).sendVerificationEmail(EMAIL, VERIFICATION_LINK);
    }

    @Test
    void resendVerificationEmail_ShouldThrowWhenRateLimitExceeded() throws FirebaseAuthException {
        for (int i = 0; i < 3; i++) {
            firebaseAuthService.resendVerificationEmail(UID);
        }

        assertThatThrownBy(() -> firebaseAuthService.resendVerificationEmail(UID))
            .isInstanceOf(RateLimitExceededException.class)
            .hasMessageContaining("Limite de reenvios");

        verify(emailService, times(3)).sendVerificationEmail(EMAIL, VERIFICATION_LINK);
    }

    @Test
    void resendVerificationEmail_ShouldThrowWhenEmailAlreadyVerified() throws FirebaseAuthException {
        when(userRecord.isEmailVerified()).thenReturn(true);

        assertThatThrownBy(() -> firebaseAuthService.resendVerificationEmail(UID))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Email já verificado");

    verify(emailService, times(0)).sendVerificationEmail(anyString(), anyString());
    }

    @Test
    void resendVerificationEmail_ShouldThrowWhenEmailMissing() throws FirebaseAuthException {
        when(userRecord.getEmail()).thenReturn(null);

        assertThatThrownBy(() -> firebaseAuthService.resendVerificationEmail(UID))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Usuário não possui email cadastrado");
    }
}
