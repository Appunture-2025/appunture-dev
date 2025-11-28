package com.appunture.backend.controller;

import com.appunture.backend.dto.response.MessageResponse;
import com.appunture.backend.dto.response.UserProfileResponse;
import com.appunture.backend.exception.RateLimitExceededException;
import com.appunture.backend.model.firestore.FirestoreUser;
import com.appunture.backend.service.FirebaseAuthService;
import com.appunture.backend.service.FirestoreUserService;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class FirestoreAuthControllerTest {

    @Autowired
    private FirestoreAuthController controller;

    @MockBean
    private FirestoreUserService userService;

    @MockBean
    private FirebaseAuthService firebaseAuthService;

    @MockBean
    private FirebaseAuth firebaseAuth;

    @MockBean
    private Firestore firestore;

    private FirebaseToken firebaseToken;

    @BeforeEach
    void setUp() {
        firebaseToken = Mockito.mock(FirebaseToken.class);
        when(firebaseToken.getUid()).thenReturn("uid-123");
        when(firebaseToken.getEmail()).thenReturn("user@appunture.com");
        when(firebaseToken.getName()).thenReturn("App User");
        when(firebaseToken.isEmailVerified()).thenReturn(true);
        when(firebaseToken.getIssuer()).thenReturn("https://securetoken.google.com/appunture");
    }

    @Test
    void getProfileReturnsProfileWhenUserExists() {
        FirestoreUser user = FirestoreUser.builder().id("doc-1").firebaseUid("uid-123").build();
        UserProfileResponse response = UserProfileResponse.builder().id("doc-1").email("user@appunture.com").build();

        when(userService.findByFirebaseUid("uid-123")).thenReturn(Optional.of(user));
        when(userService.toProfileResponse(user)).thenReturn(response);

        ResponseEntity<UserProfileResponse> result = controller.getProfile(firebaseToken);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isEqualTo(response);
        verify(userService).findByFirebaseUid("uid-123");
    }

    @Test
    void getProfileReturnsNotFoundWhenUserMissing() {
        when(userService.findByFirebaseUid("uid-123")).thenReturn(Optional.empty());

        ResponseEntity<UserProfileResponse> result = controller.getProfile(firebaseToken);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(result.getBody()).isNull();
    }

    @Test
    void addFavoriteReturnsOkWhenUserExists() {
        FirestoreUser user = FirestoreUser.builder().id("doc-1").firebaseUid("uid-123").build();
        when(userService.findByFirebaseUid("uid-123")).thenReturn(Optional.of(user));
        doNothing().when(userService).addFavoritePoint("doc-1", "point-1");

        ResponseEntity<Void> result = controller.addFavorite(firebaseToken, "point-1");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(userService).addFavoritePoint("doc-1", "point-1");
    }

    @Test
    void addFavoriteReturnsNotFoundWhenUserMissing() {
        when(userService.findByFirebaseUid("uid-123")).thenReturn(Optional.empty());

        ResponseEntity<Void> result = controller.addFavorite(firebaseToken, "point-1");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(userService).findByFirebaseUid("uid-123");
    }

    @Test
    void getCurrentUserReturnsTokenInfoAndProfile() {
        FirestoreUser user = FirestoreUser.builder().id("doc-1").firebaseUid("uid-123").build();
        UserProfileResponse profileResponse = UserProfileResponse.builder().id("doc-1").name("App User").build();

        when(userService.findByFirebaseUid("uid-123")).thenReturn(Optional.of(user));
        when(userService.toProfileResponse(user)).thenReturn(profileResponse);

        ResponseEntity<Map<String, Object>> result = controller.getCurrentUser(firebaseToken);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody()).containsKeys("firebase", "profile");
        assertThat(result.getBody().get("profile")).isEqualTo(profileResponse);
    }

    @Test
    void resendVerificationEmailReturnsTooManyRequestsWhenRateLimited() throws Exception {
        when(firebaseToken.getUid()).thenReturn("uid-123");
        Mockito.doThrow(new RateLimitExceededException("wait 5 minutes"))
                .when(firebaseAuthService).resendVerificationEmail("uid-123");

        ResponseEntity<MessageResponse> result = controller.resendVerificationEmail(firebaseToken);

        assertThat(result.getStatusCodeValue()).isEqualTo(429);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getMessage()).contains("wait");
    }

    @Test
    void resendVerificationEmailReturnsOkWhenSuccess() throws Exception {
        when(firebaseToken.getUid()).thenReturn("uid-123");
        Mockito.doNothing().when(firebaseAuthService).resendVerificationEmail("uid-123");

        ResponseEntity<MessageResponse> result = controller.resendVerificationEmail(firebaseToken);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isEqualTo(new MessageResponse("Email de verificação reenviado. Verifique sua caixa de entrada."));
    }
}