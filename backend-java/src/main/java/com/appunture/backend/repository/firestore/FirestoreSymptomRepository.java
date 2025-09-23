package com.appunture.backend.repository.firestore;

import com.appunture.backend.model.firestore.FirestoreSymptom;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * Repository para operações CRUD com sintomas no Firestore
 */
@Repository
@RequiredArgsConstructor
@Slf4j
public class FirestoreSymptomRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "symptoms";

    /**
     * Buscar sintoma por ID
     */
    public Optional<FirestoreSymptom> findById(String id) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return Optional.empty();
        }
        
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            
            if (document.exists()) {
                FirestoreSymptom symptom = document.toObject(FirestoreSymptom.class);
                if (symptom != null) {
                    symptom.setId(document.getId());
                }
                return Optional.ofNullable(symptom);
            }
            return Optional.empty();
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar sintoma por ID {}: {}", id, e.getMessage());
            Thread.currentThread().interrupt();
            return Optional.empty();
        }
    }

    /**
     * Buscar sintoma por nome
     */
    public Optional<FirestoreSymptom> findByName(String name) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return Optional.empty();
        }
        
        try {
            CollectionReference symptoms = firestore.collection(COLLECTION_NAME);
            Query query = symptoms.whereEqualTo("name", name);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            if (!documents.isEmpty()) {
                FirestoreSymptom symptom = documents.get(0).toObject(FirestoreSymptom.class);
                symptom.setId(documents.get(0).getId());
                return Optional.of(symptom);
            }
            return Optional.empty();
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar sintoma por nome {}: {}", name, e.getMessage());
            Thread.currentThread().interrupt();
            return Optional.empty();
        }
    }

    /**
     * Salvar ou atualizar sintoma
     */
    public FirestoreSymptom save(FirestoreSymptom symptom) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return symptom;
        }
        
        try {
            if (symptom.getId() == null || symptom.getId().isEmpty()) {
                // Criar novo documento
                DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
                symptom.setId(docRef.getId());
                symptom.setCreatedAt(LocalDateTime.now());
            }
            symptom.setUpdatedAt(LocalDateTime.now());
            
            ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME)
                    .document(symptom.getId()).set(symptom);
            future.get();
            
            log.debug("Sintoma salvo com sucesso: {}", symptom.getId());
            return symptom;
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao salvar sintoma: {}", e.getMessage());
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao salvar sintoma", e);
        }
    }

    /**
     * Deletar sintoma por ID
     */
    public void deleteById(String id) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return;
        }
        
        try {
            ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME)
                    .document(id).delete();
            future.get();
            
            log.debug("Sintoma deletado com sucesso: {}", id);
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao deletar sintoma {}: {}", id, e.getMessage());
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao deletar sintoma", e);
        }
    }

    /**
     * Listar todos os sintomas
     */
    public List<FirestoreSymptom> findAll() {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return List.of();
        }
        
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            return documents.stream()
                    .map(doc -> {
                        FirestoreSymptom symptom = doc.toObject(FirestoreSymptom.class);
                        symptom.setId(doc.getId());
                        return symptom;
                    })
                    .collect(Collectors.toList());
                    
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao listar sintomas: {}", e.getMessage());
            Thread.currentThread().interrupt();
            return List.of();
        }
    }

    /**
     * Buscar sintomas por categoria
     */
    public List<FirestoreSymptom> findByCategory(String category) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return List.of();
        }
        
        try {
            CollectionReference symptoms = firestore.collection(COLLECTION_NAME);
            Query query = symptoms.whereEqualTo("category", category);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            return documents.stream()
                    .map(doc -> {
                        FirestoreSymptom symptom = doc.toObject(FirestoreSymptom.class);
                        symptom.setId(doc.getId());
                        return symptom;
                    })
                    .collect(Collectors.toList());
                    
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar sintomas por categoria {}: {}", category, e.getMessage());
            Thread.currentThread().interrupt();
            return List.of();
        }
    }

    /**
     * Buscar sintomas por ponto associado
     */
    public List<FirestoreSymptom> findByPointId(String pointId) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return List.of();
        }
        
        try {
            CollectionReference symptoms = firestore.collection(COLLECTION_NAME);
            Query query = symptoms.whereArrayContains("pointIds", pointId);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            return documents.stream()
                    .map(doc -> {
                        FirestoreSymptom symptom = doc.toObject(FirestoreSymptom.class);
                        symptom.setId(doc.getId());
                        return symptom;
                    })
                    .collect(Collectors.toList());
                    
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar sintomas por ponto {}: {}", pointId, e.getMessage());
            Thread.currentThread().interrupt();
            return List.of();
        }
    }

    /**
     * Buscar sintomas por nome (busca parcial)
     */
    public List<FirestoreSymptom> findByNameContaining(String name) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return List.of();
        }
        
        try {
            // Firestore não suporta LIKE, fazendo busca client-side
            List<FirestoreSymptom> allSymptoms = findAll();
            return allSymptoms.stream()
                    .filter(symptom -> symptom.getName().toLowerCase().contains(name.toLowerCase()))
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            log.error("Erro ao buscar sintomas por nome {}: {}", name, e.getMessage());
            return List.of();
        }
    }

    /**
     * Buscar sintomas por tag
     */
    public List<FirestoreSymptom> findByTag(String tag) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return List.of();
        }
        
        try {
            CollectionReference symptoms = firestore.collection(COLLECTION_NAME);
            Query query = symptoms.whereArrayContains("tags", tag);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            return documents.stream()
                    .map(doc -> {
                        FirestoreSymptom symptom = doc.toObject(FirestoreSymptom.class);
                        symptom.setId(doc.getId());
                        return symptom;
                    })
                    .collect(Collectors.toList());
                    
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar sintomas por tag {}: {}", tag, e.getMessage());
            Thread.currentThread().interrupt();
            return List.of();
        }
    }

    /**
     * Incrementar contador de uso
     */
    public void incrementUseCount(String symptomId) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return;
        }
        
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(symptomId);
            ApiFuture<Void> future = firestore.runTransaction(transaction -> {
                DocumentSnapshot snapshot = transaction.get(docRef).get();
                if (snapshot.exists()) {
                    FirestoreSymptom symptom = snapshot.toObject(FirestoreSymptom.class);
                    Integer currentCount = symptom.getUseCount();
                    int newCount = (currentCount != null ? currentCount : 0) + 1;
                    transaction.update(docRef, "useCount", newCount);
                }
                return null;
            });
            future.get();
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao incrementar contador de uso para sintoma {}: {}", symptomId, e.getMessage());
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Buscar sintomas mais usados
     */
    public List<FirestoreSymptom> findTopUsed(int limit) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return List.of();
        }
        
        try {
            CollectionReference symptoms = firestore.collection(COLLECTION_NAME);
            Query query = symptoms.orderBy("useCount", Query.Direction.DESCENDING).limit(limit);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            return documents.stream()
                    .map(doc -> {
                        FirestoreSymptom symptom = doc.toObject(FirestoreSymptom.class);
                        symptom.setId(doc.getId());
                        return symptom;
                    })
                    .collect(Collectors.toList());
                    
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar sintomas mais usados: {}", e.getMessage());
            Thread.currentThread().interrupt();
            return List.of();
        }
    }

    /**
     * Verificar se existe sintoma com nome
     */
    public boolean existsByName(String name) {
        return findByName(name).isPresent();
    }

    /**
     * Contar total de sintomas
     */
    public long count() {
        return findAll().size();
    }
}