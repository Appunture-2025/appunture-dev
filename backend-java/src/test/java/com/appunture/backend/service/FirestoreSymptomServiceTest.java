package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestoreSymptom;
import com.appunture.backend.repository.firestore.FirestoreSymptomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FirestoreSymptomServiceTest {

    @Mock
    private FirestoreSymptomRepository symptomRepository;

    @InjectMocks
    private FirestoreSymptomService symptomService;

    private FirestoreSymptom baseSymptom;

    @BeforeEach
    void setUp() {
        baseSymptom = FirestoreSymptom.builder()
                .id("symptom-1")
                .name("Cefaleia")
                .tags(new ArrayList<>())
                .pointIds(new ArrayList<>())
                .build();
    }

    @Test
    void createSymptom_ShouldSetDefaultsAndPersist() {
        when(symptomRepository.existsByName("Cefaleia")).thenReturn(false);
        when(symptomRepository.save(any(FirestoreSymptom.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FirestoreSymptom result = symptomService.createSymptom(baseSymptom);

        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();
        assertThat(result.getUseCount()).isZero();
        assertThat(result.getAssociatedPointsCount()).isZero();
        assertThat(result.getSeverity()).isEqualTo(5);
        assertThat(result.getPriority()).isZero();
        verify(symptomRepository).save(result);
    }

    @Test
    void createSymptom_ShouldThrowWhenNameExists() {
        when(symptomRepository.existsByName("Cefaleia")).thenReturn(true);

        assertThatThrownBy(() -> symptomService.createSymptom(baseSymptom))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Já existe um sintoma com o nome");
    }

    @Test
    void updateSymptom_ShouldApplyChanges() {
        FirestoreSymptom existing = FirestoreSymptom.builder()
                .id("symptom-1")
                .name("Antigo")
                .tags(new ArrayList<>())
                .pointIds(new ArrayList<>())
                .updatedAt(LocalDateTime.now().minusHours(2))
                .build();

        FirestoreSymptom updates = FirestoreSymptom.builder()
                .name("Atualizado")
                .description("Descrição nova")
                .severity(8)
                .priority(3)
                .tags(new ArrayList<>(List.of("cabeça")))
                .build();

        when(symptomRepository.findById("symptom-1")).thenReturn(Optional.of(existing));
        when(symptomRepository.existsByName("Atualizado")).thenReturn(false);
        when(symptomRepository.save(any(FirestoreSymptom.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LocalDateTime previousUpdate = existing.getUpdatedAt();
        FirestoreSymptom result = symptomService.updateSymptom("symptom-1", updates);

        assertThat(result.getName()).isEqualTo("Atualizado");
        assertThat(result.getDescription()).isEqualTo("Descrição nova");
        assertThat(result.getSeverity()).isEqualTo(8);
        assertThat(result.getPriority()).isEqualTo(3);
        assertThat(result.getTags()).containsExactly("cabeça");
        assertThat(result.getUpdatedAt()).isAfter(previousUpdate);
        verify(symptomRepository).save(existing);
    }

    @Test
    void updateSymptom_ShouldThrowWhenNotFound() {
        when(symptomRepository.findById("symptom-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> symptomService.updateSymptom("symptom-1", new FirestoreSymptom()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Sintoma não encontrado");
    }

    @Test
    void updateSymptom_ShouldThrowWhenNewNameAlreadyExists() {
    FirestoreSymptom existing = FirestoreSymptom.builder()
        .id("symptom-1")
        .name("Antigo")
        .build();

    FirestoreSymptom updates = FirestoreSymptom.builder()
        .name("Duplicado")
        .build();

    when(symptomRepository.findById("symptom-1")).thenReturn(Optional.of(existing));
    when(symptomRepository.existsByName("Duplicado")).thenReturn(true);

    assertThatThrownBy(() -> symptomService.updateSymptom("symptom-1", updates))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Já existe um sintoma com o nome");
    }

    @Test
    void addPointToSymptom_ShouldIncrementAssociatedCount() {
        FirestoreSymptom existing = FirestoreSymptom.builder()
                .id("symptom-1")
                .pointIds(new ArrayList<>(List.of("point-1")))
                .associatedPointsCount(1)
                .build();

        when(symptomRepository.findById("symptom-1")).thenReturn(Optional.of(existing));

        symptomService.addPointToSymptom("symptom-1", "point-2");

        assertThat(existing.getPointIds()).containsExactlyInAnyOrder("point-1", "point-2");
        assertThat(existing.getAssociatedPointsCount()).isEqualTo(2);
        verify(symptomRepository).save(existing);
    }

    @Test
    void findBySeverity_ShouldFilterAndSort() {
        FirestoreSymptom low = FirestoreSymptom.builder().severity(2).build();
        FirestoreSymptom mid = FirestoreSymptom.builder().severity(6).build();
        FirestoreSymptom high = FirestoreSymptom.builder().severity(9).build();

        when(symptomRepository.findAll()).thenReturn(List.of(low, mid, high));

        List<FirestoreSymptom> result = symptomService.findBySeverity(5, 10);

        assertThat(result).containsExactly(high, mid);
    }

    @Test
    void findUniqueTags_ShouldReturnSortedDistinctValues() {
        FirestoreSymptom first = FirestoreSymptom.builder().tags(List.of("dor", "cabeça")).build();
        FirestoreSymptom second = FirestoreSymptom.builder().tags(List.of("dor", "sono")).build();
        FirestoreSymptom third = FirestoreSymptom.builder().tags(null).build();

        when(symptomRepository.findAll()).thenReturn(List.of(first, second, third));

        List<String> result = symptomService.findUniqueTags();

        assertThat(result).containsExactly("cabeça", "dor", "sono");
    }

    @Test
    void addTagToSymptom_ShouldInitializeListWhenNull() {
        FirestoreSymptom existing = FirestoreSymptom.builder()
                .id("symptom-1")
                .tags(null)
                .build();

        when(symptomRepository.findById("symptom-1")).thenReturn(Optional.of(existing));

        symptomService.addTagToSymptom("symptom-1", "cabeça");

        assertThat(existing.getTags()).containsExactly("cabeça");
        verify(symptomRepository).save(existing);
    }

    @Test
    void addTagToSymptom_ShouldAvoidDuplicates() {
        FirestoreSymptom existing = FirestoreSymptom.builder()
                .id("symptom-1")
                .tags(new ArrayList<>(List.of("cabeça")))
                .build();

        when(symptomRepository.findById("symptom-1")).thenReturn(Optional.of(existing));

        symptomService.addTagToSymptom("symptom-1", "cabeça");

        assertThat(existing.getTags()).containsExactly("cabeça");
        verify(symptomRepository).save(existing);
    }

    @Test
    void removeTagFromSymptom_ShouldRemoveAndPersist() {
        FirestoreSymptom existing = FirestoreSymptom.builder()
                .id("symptom-1")
                .tags(new ArrayList<>(List.of("cabeça", "dor")))
                .build();

        when(symptomRepository.findById("symptom-1")).thenReturn(Optional.of(existing));

        symptomService.removeTagFromSymptom("symptom-1", "dor");

        assertThat(existing.getTags()).containsExactly("cabeça");
        verify(symptomRepository).save(existing);
    }

    @Test
    void removePointFromSymptom_ShouldUpdateCount() {
        FirestoreSymptom existing = FirestoreSymptom.builder()
                .id("symptom-1")
                .pointIds(new ArrayList<>(List.of("point-1", "point-2")))
                .associatedPointsCount(2)
                .build();

        when(symptomRepository.findById("symptom-1")).thenReturn(Optional.of(existing));

        symptomService.removePointFromSymptom("symptom-1", "point-2");

        assertThat(existing.getPointIds()).containsExactly("point-1");
        assertThat(existing.getAssociatedPointsCount()).isEqualTo(1);
        verify(symptomRepository).save(existing);
    }

    @Test
    void deleteSymptom_ShouldInvokeRepositoryDelete() {
        when(symptomRepository.findById("symptom-1")).thenReturn(Optional.of(baseSymptom));

        symptomService.deleteSymptom("symptom-1");

        verify(symptomRepository).deleteById("symptom-1");
    }

    @Test
    void incrementUseCount_ShouldDelegateToRepository() {
        symptomService.incrementUseCount("symptom-1");

        verify(symptomRepository).incrementUseCount("symptom-1");
    }
}
