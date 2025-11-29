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
 * Service responsible for managing symptoms in Firestore.
 * 
 * <p>Handles all CRUD operations and search functionality for symptoms,
 * including categorization, tagging, and usage tracking for analytics.</p>
 * 
 * <h2>Main Features:</h2>
 * <ul>
 *   <li>CRUD operations for symptoms</li>
 *   <li>Search by name, category, and tag</li>
 *   <li>Association management with acupuncture points</li>
 *   <li>Usage count tracking for popularity</li>
 *   <li>Severity-based filtering</li>
 * </ul>
 * 
 * @see FirestoreSymptom
 * @see FirestoreSymptomRepository
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FirestoreSymptomService {

    private final FirestoreSymptomRepository symptomRepository;

    /**
     * Retrieves a symptom by its Firestore document ID.
     *
     * @param id The Firestore document ID
     * @return Optional containing the symptom if found, empty otherwise
     */
    public Optional<FirestoreSymptom> findById(String id) {
        log.debug("Buscando sintoma por ID: {}", id);
        return symptomRepository.findById(id);
    }

    /**
     * Retrieves a symptom by its exact name.
     *
     * @param name The exact symptom name to search for
     * @return Optional containing the symptom if found, empty otherwise
     */
    public Optional<FirestoreSymptom> findByName(String name) {
        log.debug("Buscando sintoma por nome: {}", name);
        return symptomRepository.findByName(name);
    }

    /**
     * Retrieves all symptoms from the database.
     *
     * @return List of all symptoms (may be empty if none exist)
     */
    public List<FirestoreSymptom> findAll() {
        log.debug("Listando todos os sintomas");
        return symptomRepository.findAll();
    }

    /**
     * Retrieves all symptoms in a specific category.
     *
     * @param category The category name (e.g., "Pain", "Digestive", "Respiratory")
     * @return List of symptoms in the specified category
     */
    public List<FirestoreSymptom> findByCategory(String category) {
        log.debug("Buscando sintomas por categoria: {}", category);
        return symptomRepository.findByCategory(category);
    }

    /**
     * Retrieves all symptoms associated with a specific acupuncture point.
     *
     * @param pointId The Firestore document ID of the point
     * @return List of symptoms that can be treated by the specified point
     */
    public List<FirestoreSymptom> findByPointId(String pointId) {
        log.debug("Buscando sintomas por ponto: {}", pointId);
        return symptomRepository.findByPointId(pointId);
    }

    /**
     * Searches symptoms by partial name match (case-insensitive).
     *
     * @param name The search term to match against symptom names
     * @return List of symptoms with names containing the search term
     */
    public List<FirestoreSymptom> findByNameContaining(String name) {
        log.debug("Buscando sintomas por nome: {}", name);
        return symptomRepository.findByNameContaining(name);
    }

    /**
     * Retrieves all symptoms with a specific tag.
     *
     * @param tag The tag to search for
     * @return List of symptoms with the specified tag
     */
    public List<FirestoreSymptom> findByTag(String tag) {
        log.debug("Buscando sintomas por tag: {}", tag);
        return symptomRepository.findByTag(tag);
    }

    /**
     * Creates a new symptom.
     *
     * @param symptom The symptom entity to create (name must be unique)
     * @return The created symptom with generated Firestore ID
     * @throws IllegalArgumentException if a symptom with the same name already exists
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
     * Updates an existing symptom.
     * Only non-null fields in the updates object will be applied.
     *
     * @param id The Firestore document ID of the symptom to update
     * @param updates The symptom entity containing fields to update
     * @return The updated symptom
     * @throws IllegalArgumentException if symptom not found or new name already exists
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
     * Deletes a symptom.
     *
     * @param id The Firestore document ID of the symptom to delete
     * @throws IllegalArgumentException if symptom not found
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