package com.appunture.backend.controller;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.service.FirestorePointService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FirestorePointControllerTest {

    @Mock
    private FirestorePointService pointService;

    @InjectMocks
    private FirestorePointController controller;

    @Test
    void getAllPointsReturnsList() {
        FirestorePoint point = FirestorePoint.builder().id("VG20").code("VG20").build();
        when(pointService.findAll()).thenReturn(List.of(point));

        ResponseEntity<List<FirestorePoint>> response = controller.getAllPoints();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(point);
    }

    @Test
    void getPointByIdReturnsNotFoundWhenMissing() {
        when(pointService.findById("missing")).thenReturn(Optional.empty());

        ResponseEntity<FirestorePoint> response = controller.getPointById("missing");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
    }
}