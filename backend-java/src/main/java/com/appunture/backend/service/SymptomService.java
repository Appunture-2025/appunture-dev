package com.appunture.backend.service;

import com.appunture.backend.entity.Symptom;
import com.appunture.backend.entity.PointSymptom;
import com.appunture.backend.repository.SymptomRepository;
import com.appunture.backend.repository.PointSymptomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.appunture.backend.dto.symptom.SymptomRequest;
import com.appunture.backend.dto.symptom.SymptomResponse;
import com.appunture.backend.dto.mapper.SymptomMapper;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SymptomService {

    private final SymptomRepository symptomRepository;
    private final PointSymptomRepository pointSymptomRepository;
    private final SymptomMapper symptomMapper;

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
    public List<SymptomResponse> list() { 
        return symptomRepository.findAll().stream()
                .map(symptomMapper::toResponse)
                .toList(); 
    }

    /**
     * Lista sintomas com paginação
     */
    @Transactional
    public Page<SymptomResponse> listPaginated(Pageable pageable) {
        Page<Symptom> symptomsPage = symptomRepository.findAll(pageable);
        return symptomsPage.map(symptomMapper::toResponse);
    }

    /**
     * Busca sintomas por nome (busca parcial)
     */
    @Transactional
    public List<SymptomResponse> searchByName(String name) {
        return symptomRepository.findByNameContainingIgnoreCase(name).stream()
                .map(symptomMapper::toResponse)
                .toList();
    }

    /**
     * Lista sintomas por categoria
     */
    @Transactional
    public List<SymptomResponse> findByCategory(String category) {
        return symptomRepository.findByCategoryIgnoreCase(category).stream()
                .map(symptomMapper::toResponse)
                .toList();
    }

    /**
     * Lista todas as categorias únicas
     */
    @Transactional
    public List<String> getAllCategories() {
        return symptomRepository.findAll().stream()
                .map(Symptom::getCategory)
                .distinct()
                .sorted()
                .toList();
    }

    /**
     * Busca sintoma por nome exato
     */
    @Transactional
    public Optional<SymptomResponse> findByName(String name) {
        return symptomRepository.findByNameIgnoreCase(name)
                .map(symptomMapper::toResponse);
    }

    /**
     * Lista pontos associados a um sintoma
     */
    @Transactional
    public List<Long> getAssociatedPoints(Long symptomId) {
        return pointSymptomRepository.findBySymptomId(symptomId).stream()
                .map(ps -> ps.getPoint().getId())
                .toList();
    }

    /**
     * Conta total de sintomas
     */
    @Transactional
    public long countSymptoms() {
        return symptomRepository.count();
    }

    /**
     * Verifica se um sintoma existe por nome
     */
    public boolean existsByName(String name) {
        return symptomRepository.findByNameIgnoreCase(name).isPresent();
    }

    /**
     * Lista sintomas mais utilizados (com mais associações)
     */
    @Transactional
    public List<SymptomResponse> getMostUsedSymptoms(int limit) {
        // Esta implementação requer uma query customizada no repository
        // Por enquanto, retorna todos ordenados por nome
        return symptomRepository.findAll().stream()
                .limit(limit)
                .map(symptomMapper::toResponse)
                .toList();
    }
}
