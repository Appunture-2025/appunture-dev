package com.appunture.backend.controller;

import com.appunture.backend.model.firestore.FirestoreUser;
import com.appunture.backend.service.FirebaseAuthService;
import com.appunture.backend.service.FirestorePointService;
import com.appunture.backend.service.FirestoreSymptomService;
import com.appunture.backend.service.FirestoreUserService;
import com.appunture.backend.service.SeedDataService;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class FirestoreAdminControllerTest {

    @Autowired
    private FirestoreAdminController controller;

    @MockBean
    private FirestoreUserService userService;

    @MockBean
    private FirestorePointService pointService;

    @MockBean
    private FirestoreSymptomService symptomService;

    @MockBean
    private FirebaseAuthService firebaseAuthService;

    @MockBean
    private SeedDataService seedDataService;

    @MockBean
    private FirebaseAuth firebaseAuth;

    @MockBean
    private Firestore firestore;

    private FirebaseToken firebaseToken;

    @BeforeEach
    void setUp() {
        firebaseToken = Mockito.mock(FirebaseToken.class);
        when(firebaseToken.getUid()).thenReturn("admin-uid");
        when(firebaseToken.getEmail()).thenReturn("admin@appunture.com");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getDashboard_ShouldReturnStatistics() {
        // Given
        when(userService.count()).thenReturn(10L);
        when(pointService.count()).thenReturn(361L);
        when(symptomService.count()).thenReturn(100L);
        
        FirestoreUser user = FirestoreUser.builder()
                .id("user-1")
                .createdAt(LocalDateTime.now())
                .build();
        when(userService.findAll()).thenReturn(List.of(user));
        when(pointService.findPopularPoints(anyInt())).thenReturn(List.of());
        when(symptomService.findTopUsed(anyInt())).thenReturn(List.of());

        // When
        ResponseEntity<Map<String, Object>> response = controller.getDashboard();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).containsKey("statistics");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllUsers_ShouldReturnUsersList() {
        // Given
        FirestoreUser user = FirestoreUser.builder().id("user-1").build();
        when(userService.findAll()).thenReturn(List.of(user));

        // When
        ResponseEntity<List<FirestoreUser>> response = controller.getAllUsers();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUserDetails_ShouldReturnNotFoundWhenUserMissing() {
        // Given
        when(userService.findById("missing")).thenReturn(Optional.empty());

        // When
        ResponseEntity<FirestoreUser> response = controller.getUserDetails("missing");

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUserDetails_ShouldReturnUserWhenFound() {
        // Given
        FirestoreUser user = FirestoreUser.builder().id("user-1").build();
        when(userService.findById("user-1")).thenReturn(Optional.of(user));

        // When
        ResponseEntity<FirestoreUser> response = controller.getUserDetails("user-1");

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void seedData_ShouldReturnSuccessResult() {
        // Given
        when(seedDataService.importAllSeedData()).thenReturn(Map.of(
                "success", true,
                "pointsImported", 361,
                "symptomsImported", 100
        ));

        // When
        ResponseEntity<Map<String, Object>> response = controller.seedData(firebaseToken);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("success", true);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void seedData_ShouldReturnBadRequestOnFailure() {
        // Given
        when(seedDataService.importAllSeedData()).thenReturn(Map.of(
                "success", false,
                "error", "Import failed"
        ));

        // When
        ResponseEntity<Map<String, Object>> response = controller.seedData(firebaseToken);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminHealthCheck_ShouldReturnHealthStatus() {
        // Given
        when(userService.count()).thenReturn(10L);

        // When
        ResponseEntity<Map<String, Object>> response = controller.adminHealthCheck();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsKey("status");
        assertThat(response.getBody()).containsKey("services");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateUserRole_ShouldReturnBadRequestForInvalidRole() {
        // Given
        Map<String, String> request = Map.of("role", "INVALID");

        // When
        ResponseEntity<FirestoreUser> response = controller.updateUserRole("user-1", request);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getDetailedStats_ShouldReturnComprehensiveStats() {
        // Given
        when(userService.count()).thenReturn(10L);
        when(pointService.count()).thenReturn(361L);
        when(symptomService.count()).thenReturn(100L);
        when(userService.findByRole("ADMIN")).thenReturn(List.of());
        when(userService.findByRole("USER")).thenReturn(List.of());
        when(symptomService.findUniqueCategories()).thenReturn(List.of("Pain", "Digestive"));
        when(symptomService.findUniqueTags()).thenReturn(List.of("acute", "chronic"));
        when(pointService.findPopularPoints(anyInt())).thenReturn(List.of());
        when(symptomService.findTopUsed(anyInt())).thenReturn(List.of());

        // When
        ResponseEntity<Map<String, Object>> response = controller.getDetailedStats();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsKeys("users", "points", "symptoms", "categories", "tags");
    }
}
