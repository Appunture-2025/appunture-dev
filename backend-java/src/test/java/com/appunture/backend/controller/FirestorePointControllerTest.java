package com.appunture.backend.controller;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.service.FirestorePointService;
import com.google.firebase.auth.FirebaseToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
class FirestorePointControllerTest {

    @Autowired
    private FirestorePointController controller;

    @MockBean
    private FirestorePointService pointService;

    private FirebaseToken firebaseToken;

    @BeforeEach
    void setUp() {
        firebaseToken = Mockito.mock(FirebaseToken.class);
        when(firebaseToken.getUid()).thenReturn("admin-uid");
        when(firebaseToken.getEmail()).thenReturn("admin@appunture.com");
    }

    @Test
    void getAllPointsReturnsList() {
        FirestorePoint point = FirestorePoint.builder().id("VG20").code("VG20").build();
        when(pointService.findAll()).thenReturn(List.of(point));

        ResponseEntity<List<FirestorePoint>> response = controller.getAllPoints();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(point);
        verify(pointService).findAll();
    }

    @Test
    void getPointByIdReturnsNotFoundWhenMissing() {
        when(pointService.findById("missing")).thenReturn(Optional.empty());

        ResponseEntity<FirestorePoint> response = controller.getPointById("missing");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
    }

    @Test
    void createPointReturnsCreated() {
        FirestorePoint payload = FirestorePoint.builder().code("VG20").name("Baihui").build();
        FirestorePoint saved = FirestorePoint.builder().id("doc-1").code("VG20").createdBy("admin-uid").build();
        when(pointService.createPoint(any(FirestorePoint.class))).thenReturn(saved);

        ResponseEntity<FirestorePoint> response = controller.createPoint(firebaseToken, payload);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(saved);
        verify(pointService).createPoint(payload);
        assertThat(payload.getCreatedBy()).isEqualTo("admin-uid");
    }

    @Test
    void createPointReturnsBadRequestOnValidationError() {
        FirestorePoint payload = FirestorePoint.builder().code("VG20").build();
        when(pointService.createPoint(any(FirestorePoint.class))).thenThrow(new IllegalArgumentException("invalid"));

        ResponseEntity<FirestorePoint> response = controller.createPoint(firebaseToken, payload);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void updatePointReturnsOk() {
        FirestorePoint updates = FirestorePoint.builder().name("Updated").build();
        FirestorePoint updated = FirestorePoint.builder().id("VG20").name("Updated").build();
        when(pointService.updatePoint(eq("VG20"), any(FirestorePoint.class))).thenReturn(updated);

        ResponseEntity<FirestorePoint> response = controller.updatePoint("VG20", updates);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(updated);
    }

    @Test
    void getPointsStatsReturnsAggregatedData() {
        when(pointService.count()).thenReturn(42L);
        when(pointService.findPopularPoints(5)).thenReturn(List.of());

        ResponseEntity<java.util.Map<String, Object>> response = controller.getPointsStats();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).containsEntry("totalPoints", 42L);
    }
}