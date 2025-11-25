package com.appunture.backend.controller;

import com.appunture.backend.service.FirestorePointService;
import com.appunture.backend.service.FirestoreSymptomService;
import com.appunture.backend.service.FirestoreUserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@SpringBootTest
class FirestoreHealthControllerTest {

    @Autowired
    private FirestoreHealthController controller;

    @MockBean
    private FirestoreUserService userService;

    @MockBean
    private FirestorePointService pointService;

    @MockBean
    private FirestoreSymptomService symptomService;

    @Test
    void healthCheckReturnsUpStatus() {
        ResponseEntity<Map<String, Object>> response = controller.healthCheck();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).containsEntry("status", "UP");
    }

    @Test
    void detailedHealthCheckReflectsFirestoreFailures() {
        when(userService.count()).thenThrow(new RuntimeException("Firestore down"));
        when(pointService.count()).thenReturn(0L);
        when(symptomService.count()).thenReturn(0L);

        ResponseEntity<Map<String, Object>> response = controller.detailedHealthCheck();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        Map<String, Object> components = (Map<String, Object>) response.getBody().get("components");
        Map<String, Object> firestore = (Map<String, Object>) components.get("firestore");
        assertThat(firestore).containsEntry("status", "DOWN");
    }

    @Test
    void readinessCheckReturnsNotReadyWhenCountsFail() {
        when(userService.count()).thenThrow(new RuntimeException("Firestore down"));

        ResponseEntity<Map<String, Object>> response = controller.readinessCheck();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).containsEntry("ready", false);
    }

    @Test
    void metricsEndpointReturnsCounters() {
        when(userService.count()).thenReturn(5L);
        when(pointService.count()).thenReturn(10L);
        when(symptomService.count()).thenReturn(3L);

        ResponseEntity<Map<String, Object>> response = controller.getMetrics();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        Map<String, Object> counts = (Map<String, Object>) ((Map<String, Object>) response.getBody().get("counts"));
        assertThat(counts).containsEntry("users", 5L);
        assertThat(counts).containsEntry("points", 10L);
    }
}