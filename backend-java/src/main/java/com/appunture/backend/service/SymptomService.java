package com.appunture.backend.service;

import com.appunture.backend.entity.Symptom;
import com.appunture.backend.repository.SymptomRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import com.appunture.backend.dto.symptom.SymptomRequest;
import com.appunture.backend.dto.symptom.SymptomResponse;
import com.appunture.backend.dto.mapper.SymptomMapper;

import java.util.List;

@Service
public class SymptomService {

    private final SymptomRepository symptomRepository;
    private final SymptomMapper symptomMapper;

    public SymptomService(SymptomRepository symptomRepository, SymptomMapper symptomMapper) {
        this.symptomRepository = symptomRepository;
        this.symptomMapper = symptomMapper;
    }

    @Transactional
    public SymptomResponse create(SymptomRequest request) {
        if (symptomRepository.findByNameIgnoreCase(request.getName()).isPresent()) {
            throw new IllegalArgumentException("Symptom name already exists");
        }
        Symptom entity = symptomMapper.toEntity(request);
        return symptomMapper.toResponse(symptomRepository.save(entity));
    }

    @Transactional
    public SymptomResponse update(Long id, SymptomRequest request) {
        Symptom existing = getEntity(id);
        symptomMapper.updateEntity(request, existing);
        return symptomMapper.toResponse(existing);
    }

    @Transactional
    public void delete(Long id) { symptomRepository.delete(getEntity(id)); }

    @Transactional
    public SymptomResponse get(Long id) { return symptomMapper.toResponse(getEntity(id)); }

    private Symptom getEntity(Long id) { return symptomRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Symptom not found")); }

    @Transactional
    public List<SymptomResponse> list() { return symptomRepository.findAll().stream().map(symptomMapper::toResponse).toList(); }
}
