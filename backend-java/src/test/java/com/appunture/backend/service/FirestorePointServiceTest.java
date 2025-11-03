package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.repository.firestore.FirestorePointRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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
        verify(pointRepository).save(result);
    }

    @Test
    void createPoint_ShouldThrowWhenCodeAlreadyExists() {
        when(pointRepository.existsByCode("P1")).thenReturn(true);

        assertThatThrownBy(() -> pointService.createPoint(basePoint))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Já existe um ponto com o código");
    }

    @Test
    void updatePoint_ShouldApplyChangesAndPersist() {
        LocalDateTime beforeUpdate = LocalDateTime.now().minusSeconds(1);
        FirestorePoint existing = FirestorePoint.builder()
                .id("point-1")
                .code("OLD")
                .name("Old Name")
                .symptomIds(new ArrayList<>())
                .imageUrls(new ArrayList<>())
                .updatedAt(beforeUpdate)
                .build();

        FirestorePoint updates = FirestorePoint.builder()
                .code("NEW")
                .name("New Name")
                .description("Updated description")
                .coordinates(Map.of("x", 10.0, "y", 20.0))
                .build();

        when(pointRepository.findById("point-1")).thenReturn(Optional.of(existing));
        when(pointRepository.existsByCode("NEW")).thenReturn(false);
        when(pointRepository.save(any(FirestorePoint.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FirestorePoint result = pointService.updatePoint("point-1", updates);

        assertThat(result.getCode()).isEqualTo("NEW");
        assertThat(result.getName()).isEqualTo("New Name");
        assertThat(result.getDescription()).isEqualTo("Updated description");
        assertThat(result.getCoordinates()).containsEntry("x", 10.0);
        assertThat(result.getUpdatedAt()).isAfterOrEqualTo(beforeUpdate);
        verify(pointRepository).save(existing);
    }

    @Test
    void updatePoint_ShouldThrowWhenPointNotFound() {
        when(pointRepository.findById("point-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pointService.updatePoint("point-1", new FirestorePoint()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Ponto não encontrado");
    }

    @Test
    void addSymptomToPoint_ShouldPersistUpdatedList() {
        FirestorePoint existing = FirestorePoint.builder()
                .id("point-1")
                .symptomIds(new ArrayList<>(List.of("symptom-1")))
                .build();

        when(pointRepository.findById("point-1")).thenReturn(Optional.of(existing));

        pointService.addSymptomToPoint("point-1", "symptom-2");

        assertThat(existing.getSymptomIds()).containsExactlyInAnyOrder("symptom-1", "symptom-2");
        verify(pointRepository).save(existing);
    }

    @Test
    void findPopularPoints_ShouldReturnSortedByFavorites() {
        FirestorePoint low = FirestorePoint.builder().favoriteCount(1).build();
        FirestorePoint mid = FirestorePoint.builder().favoriteCount(5).build();
        FirestorePoint high = FirestorePoint.builder().favoriteCount(10).build();

        when(pointRepository.findAll()).thenReturn(List.of(low, mid, high));

        List<FirestorePoint> result = pointService.findPopularPoints(2);

        assertThat(result).hasSize(2);
        assertThat(result.get(0)).isEqualTo(high);
        assertThat(result.get(1)).isEqualTo(mid);
    }
}
