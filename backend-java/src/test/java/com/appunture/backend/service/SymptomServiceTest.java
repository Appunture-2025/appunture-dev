package com.appunture.backend.service;

import com.appunture.backend.dto.mapper.SymptomMapper;
import com.appunture.backend.dto.symptom.SymptomRequest;
import com.appunture.backend.dto.symptom.SymptomResponse;
import com.appunture.backend.entity.Symptom;
import com.appunture.backend.repository.SymptomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class SymptomServiceTest {

    @Mock
    private SymptomRepository symptomRepository;

    private SymptomMapper symptomMapper = Mappers.getMapper(SymptomMapper.class);

    @InjectMocks
    private SymptomService symptomService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        symptomService = new SymptomService(symptomRepository, symptomMapper);
    }

    @Test
    void create_ok() {
        SymptomRequest req = new SymptomRequest();
        req.setName("Headache");
        when(symptomRepository.findByNameIgnoreCase("Headache")).thenReturn(Optional.empty());
        when(symptomRepository.save(any(Symptom.class))).thenAnswer(inv -> {
            Symptom s = inv.getArgument(0);
            s.setId(10L);
            return s;
        });
        SymptomResponse res = symptomService.create(req);
        assertEquals(10L, res.getId());
        assertEquals("Headache", res.getName());
    }

    @Test
    void create_duplicate() {
        SymptomRequest req = new SymptomRequest();
        req.setName("Headache");
        when(symptomRepository.findByNameIgnoreCase("Headache")).thenReturn(Optional.of(new Symptom()));
        assertThrows(IllegalArgumentException.class, () -> symptomService.create(req));
    }
}
