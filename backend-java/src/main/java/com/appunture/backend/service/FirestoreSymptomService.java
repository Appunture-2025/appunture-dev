package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestoreSymptom;
import com.appunture.backend.repository.firestore.FirestoreSymptomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service para operações com sintomas usando Firestore
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FirestoreSymptomService {

    private final FirestoreSymptomRepository symptomRepository;

    /**
     * Busca um sintoma por ID
     */
    public Optional<FirestoreSymptom> findById(String id) {
        log.debug("Buscando sintoma por ID: {}", id);
        return symptomRepository.findById(id);
    }

    /**
     * Busca um sintoma por nome
     */
    public Optional<FirestoreSymptom> findByName(String name) {
        log.debug("Buscando sintoma por nome: {}", name);
        return symptomRepository.findByName(name);
    }

    /**
     * Lista todos os sintomas
     */
    public List<FirestoreSymptom> findAll() {
        log.debug("Listando todos os sintomas");
        return symptomRepository.findAll();
    }

    /**
     * Busca sintomas por categoria
     */
    public List<FirestoreSymptom> findByCategory(String category) {
        log.debug("Buscando sintomas por categoria: {}", category);
        return symptomRepository.findByCategory(category);
    }

    /**
     * Busca sintomas por ponto
     */
    public List<FirestoreSymptom> findByPointId(String pointId) {
        log.debug("Buscando sintomas por ponto: {}", pointId);
        return symptomRepository.findByPointId(pointId);
    }

    /**
     * Busca sintomas por nome (busca parcial)
     */
    public List<FirestoreSymptom> findByNameContaining(String name) {
        log.debug("Buscando sintomas por nome: {}", name);
        return symptomRepository.findByNameContaining(name);
    }

    /**
     * Busca sintomas por tag
     */
    public List<FirestoreSymptom> findByTag(String tag) {
        log.debug("Buscando sintomas por tag: {}", tag);
        return symptomRepository.findByTag(tag);
    }

    /**
     * Cria um novo sintoma
     */
    public FirestoreSymptom createSymptom(FirestoreSymptom symptom) {
        log.debug("Criando novo sintoma: {}", symptom.getName());
        
        if (symptom.getName() != null && symptomRepository.existsByName(symptom.getName())) {
            throw new IllegalArgumentException("Já existe um sintoma com o nome: " + symptom.getName());
        }

        symptom.setCreatedAt(LocalDateTime.now());
        symptom.setUpdatedAt(LocalDateTime.now());
        
        if (symptom.getUseCount() == null) {
            symptom.setUseCount(0);
        }
        if (symptom.getAssociatedPointsCount() == null) {
            symptom.setAssociatedPointsCount(0);
        }
        if (symptom.getSeverity() == null) {
            symptom.setSeverity(5); // Severidade média por padrão
        }
        if (symptom.getPriority() == null) {
            symptom.setPriority(0);
        }

        return symptomRepository.save(symptom);
    }

    /**
     * Atualiza um sintoma existente
     */
    public FirestoreSymptom updateSymptom(String id, FirestoreSymptom updates) {
        log.debug("Atualizando sintoma: {}", id);
        
        Optional<FirestoreSymptom> existing = symptomRepository.findById(id);
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("Sintoma não encontrado: " + id);
        }

        FirestoreSymptom symptom = existing.get();
        
        // Atualizar apenas campos não nulos
        if (updates.getName() != null && !updates.getName().equals(symptom.getName())) {
            if (symptomRepository.existsByName(updates.getName())) {
                throw new IllegalArgumentException("Já existe um sintoma com o nome: " + updates.getName());
            }
            symptom.setName(updates.getName());
        }
        if (updates.getDescription() != null) {
            symptom.setDescription(updates.getDescription());
        }
        if (updates.getCategory() != null) {
            symptom.setCategory(updates.getCategory());
        }
        if (updates.getTags() != null) {
            symptom.setTags(updates.getTags());
        }
        if (updates.getPointIds() != null) {
            symptom.setPointIds(updates.getPointIds());
        }
        if (updates.getSeverity() != null) {
            symptom.setSeverity(updates.getSeverity());
        }
        if (updates.getPriority() != null) {
            symptom.setPriority(updates.getPriority());
        }
        
        symptom.setUpdatedAt(LocalDateTime.now());

        return symptomRepository.save(symptom);
    }

    /**
     * Deleta um sintoma
     */
    public void deleteSymptom(String id) {
        log.debug("Deletando sintoma: {}", id);
        
        Optional<FirestoreSymptom> symptom = symptomRepository.findById(id);
        if (symptom.isEmpty()) {
            throw new IllegalArgumentException("Sintoma não encontrado: " + id);
        }

        symptomRepository.deleteById(id);
        log.info("Sintoma deletado com sucesso: {}", id);
    }

    /**
     * Adiciona ponto ao sintoma
     */
    public void addPointToSymptom(String symptomId, String pointId) {
        log.debug("Adicionando ponto {} ao sintoma {}", pointId, symptomId);
        
        Optional<FirestoreSymptom> symptomOpt = symptomRepository.findById(symptomId);
        if (symptomOpt.isEmpty()) {
            throw new IllegalArgumentException("Sintoma não encontrado: " + symptomId);
        }

        FirestoreSymptom symptom = symptomOpt.get();
        symptom.addPointId(pointId);
        symptom.setUpdatedAt(LocalDateTime.now());
        
        // Atualizar contador de pontos associados
        if (symptom.getPointIds() != null) {
            symptom.setAssociatedPointsCount(symptom.getPointIds().size());
        }

        symptomRepository.save(symptom);
        log.debug("Ponto adicionado ao sintoma com sucesso");
    }

    /**
     * Remove ponto do sintoma
     */
    public void removePointFromSymptom(String symptomId, String pointId) {
        log.debug("Removendo ponto {} do sintoma {}", pointId, symptomId);
        
        Optional<FirestoreSymptom> symptomOpt = symptomRepository.findById(symptomId);
        if (symptomOpt.isEmpty()) {
            throw new IllegalArgumentException("Sintoma não encontrado: " + symptomId);
        }

        FirestoreSymptom symptom = symptomOpt.get();
        symptom.removePointId(pointId);
        symptom.setUpdatedAt(LocalDateTime.now());
        
        // Atualizar contador de pontos associados
        if (symptom.getPointIds() != null) {
            symptom.setAssociatedPointsCount(symptom.getPointIds().size());
        }

        symptomRepository.save(symptom);
        log.debug("Ponto removido do sintoma com sucesso");
    }

    /**
     * Adiciona tag ao sintoma
     */
    public void addTagToSymptom(String symptomId, String tag) {
        log.debug("Adicionando tag {} ao sintoma {}", tag, symptomId);
        
        Optional<FirestoreSymptom> symptomOpt = symptomRepository.findById(symptomId);
        if (symptomOpt.isEmpty()) {
            throw new IllegalArgumentException("Sintoma não encontrado: " + symptomId);
        }

        FirestoreSymptom symptom = symptomOpt.get();
        if (symptom.getTags() == null) {
            symptom.setTags(List.of(tag));
        } else if (!symptom.getTags().contains(tag)) {
            symptom.getTags().add(tag);
        }
        symptom.setUpdatedAt(LocalDateTime.now());

        symptomRepository.save(symptom);
        log.debug("Tag adicionada ao sintoma com sucesso");
    }

    /**
     * Remove tag do sintoma
     */
    public void removeTagFromSymptom(String symptomId, String tag) {
        log.debug("Removendo tag {} do sintoma {}", tag, symptomId);
        
        Optional<FirestoreSymptom> symptomOpt = symptomRepository.findById(symptomId);
        if (symptomOpt.isEmpty()) {
            throw new IllegalArgumentException("Sintoma não encontrado: " + symptomId);
        }

        FirestoreSymptom symptom = symptomOpt.get();
        if (symptom.getTags() != null) {
            symptom.getTags().remove(tag);
            symptom.setUpdatedAt(LocalDateTime.now());
            symptomRepository.save(symptom);
            log.debug("Tag removida do sintoma com sucesso");
        }
    }

    /**
     * Incrementa contador de uso
     */
    public void incrementUseCount(String symptomId) {
        log.debug("Incrementando contador de uso do sintoma: {}", symptomId);
        symptomRepository.incrementUseCount(symptomId);
    }

    /**
     * Busca sintomas mais usados
     */
    public List<FirestoreSymptom> findTopUsed(int limit) {
        log.debug("Buscando {} sintomas mais usados", limit);
        return symptomRepository.findTopUsed(limit);
    }

    /**
     * Busca sintomas por severidade
     */
    public List<FirestoreSymptom> findBySeverity(int minSeverity, int maxSeverity) {
        log.debug("Buscando sintomas por severidade: {} - {}", minSeverity, maxSeverity);
        
        List<FirestoreSymptom> allSymptoms = symptomRepository.findAll();
        
        return allSymptoms.stream()
                .filter(symptom -> {
                    Integer severity = symptom.getSeverity();
                    return severity != null && severity >= minSeverity && severity <= maxSeverity;
                })
                .sorted((s1, s2) -> {
                    Integer sev1 = s1.getSeverity() != null ? s1.getSeverity() : 0;
                    Integer sev2 = s2.getSeverity() != null ? s2.getSeverity() : 0;
                    return sev2.compareTo(sev1); // Ordem decrescente de severidade
                })
                .toList();
    }

    /**
     * Verifica se existe sintoma com nome
     */
    public boolean existsByName(String name) {
        return symptomRepository.existsByName(name);
    }

    /**
     * Conta total de sintomas
     */
    public long count() {
        return symptomRepository.count();
    }

    /**
     * Busca categorias únicas de sintomas
     */
    public List<String> findUniqueCategories() {
        List<FirestoreSymptom> allSymptoms = symptomRepository.findAll();
        
        return allSymptoms.stream()
                .map(FirestoreSymptom::getCategory)
                .filter(category -> category != null && !category.isEmpty())
                .distinct()
                .sorted()
                .toList();
    }

    /**
     * Busca tags únicas de sintomas
     */
    public List<String> findUniqueTags() {
        List<FirestoreSymptom> allSymptoms = symptomRepository.findAll();
        
        return allSymptoms.stream()
                .filter(symptom -> symptom.getTags() != null)
                .flatMap(symptom -> symptom.getTags().stream())
                .distinct()
                .sorted()
                .toList();
    }
}