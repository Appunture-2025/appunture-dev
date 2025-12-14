package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.repository.firestore.FirestorePointRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FirestorePointServiceTest {

    @Mock
    private FirestorePointRepository pointRepository;

    @InjectMocks
    private FirestorePointService pointService;

    private FirestorePoint basePoint;

    @BeforeEach
    void setUp() {
        basePoint = FirestorePoint.builder()
                .id("point-1")
                .code("P1")
                .name("Test Point")
                .symptomIds(new ArrayList<>())
                .imageUrls(new ArrayList<>())
                .build();
    }

    @Test
    void createPoint_ShouldSetDefaultValuesAndPersist() {
        when(pointRepository.existsByCode("P1")).thenReturn(false);
        when(pointRepository.save(any(FirestorePoint.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FirestorePoint result = pointService.createPoint(basePoint);

        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();
        assertThat(result.getFavoriteCount()).isZero();
        assertThat(result.getViewCount()).isZero();
    }

    @Test
    void createPoint_ShouldThrowWhenCodeAlreadyExists() {
        when(pointRepository.existsByCode("P1")).thenReturn(true);

        assertThatThrownBy(() -> pointService.createPoint(basePoint))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Já existe um ponto com o código");
    }
}
