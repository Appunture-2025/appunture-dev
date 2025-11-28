package com.appunture.backend.controller;

import com.appunture.backend.model.firestore.FirestoreSymptom;
import com.appunture.backend.service.FirestoreSymptomService;
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

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class FirestoreSymptomControllerTest {

    @Autowired
    private FirestoreSymptomController controller;

    @MockBean
    private FirestoreSymptomService symptomService;

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
    void getAllSymptoms_ShouldReturnList() {
        // Given
        FirestoreSymptom symptom = FirestoreSymptom.builder().id("sym-1").name("Dor de cabeça").build();
        when(symptomService.findAll()).thenReturn(List.of(symptom));

        // When
        ResponseEntity<List<FirestoreSymptom>> response = controller.getAllSymptoms();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void getSymptomById_ShouldReturnNotFoundWhenMissing() {
        // Given
        when(symptomService.findById("missing")).thenReturn(Optional.empty());

        // When
        ResponseEntity<FirestoreSymptom> response = controller.getSymptomById("missing");

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getSymptomById_ShouldReturnSymptomWhenFound() {
        // Given
        FirestoreSymptom symptom = FirestoreSymptom.builder().id("sym-1").build();
        when(symptomService.findById("sym-1")).thenReturn(Optional.of(symptom));

        // When
        ResponseEntity<FirestoreSymptom> response = controller.getSymptomById("sym-1");

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createSymptom_ShouldReturnCreated() {
        // Given
        FirestoreSymptom payload = FirestoreSymptom.builder().name("Nova Dor").build();
        FirestoreSymptom saved = FirestoreSymptom.builder().id("sym-new").name("Nova Dor").build();
        when(symptomService.createSymptom(any(FirestoreSymptom.class))).thenReturn(saved);

        // When
        ResponseEntity<FirestoreSymptom> response = controller.createSymptom(firebaseToken, payload);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getName()).isEqualTo("Nova Dor");
    }

    @Test
    void getSymptomsByCategory_ShouldReturnFilteredList() {
        // Given
        FirestoreSymptom symptom = FirestoreSymptom.builder().id("sym-1").category("Pain").build();
        when(symptomService.findByCategory("Pain")).thenReturn(List.of(symptom));

        // When
        ResponseEntity<List<FirestoreSymptom>> response = controller.getSymptomsByCategory("Pain");

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    void searchSymptoms_ShouldReturnMatchingSymptoms() {
        // Given
        FirestoreSymptom symptom = FirestoreSymptom.builder().id("sym-1").name("Dor de cabeça").build();
        when(symptomService.findByNameContaining("dor")).thenReturn(List.of(symptom));

        // When
        ResponseEntity<List<FirestoreSymptom>> response = controller.searchSymptomsByName("dor");

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();
    }

    @Test
    void getCategories_ShouldReturnCategoriesList() {
        // Given
        when(symptomService.findUniqueCategories()).thenReturn(List.of("Pain", "Digestive", "Respiratory"));

        // When
        ResponseEntity<List<String>> response = controller.getCategories();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly("Pain", "Digestive", "Respiratory");
    }

    @Test
    void getPopularSymptoms_ShouldReturnTopUsed() {
        // Given
        FirestoreSymptom symptom = FirestoreSymptom.builder().id("sym-1").useCount(100).build();
        when(symptomService.findTopUsed(anyInt())).thenReturn(List.of(symptom));

        // When
        ResponseEntity<List<FirestoreSymptom>> response = controller.getPopularSymptoms(5);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }
}
