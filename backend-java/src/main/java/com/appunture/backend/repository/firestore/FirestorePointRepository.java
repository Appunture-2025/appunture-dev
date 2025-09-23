package com.appunture.backend.repository.firestore;

import com.appunture.backend.model.firestore.FirestorePoint;
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
 * Repository para operações CRUD com pontos de acupuntura no Firestore
 */
@Repository
@RequiredArgsConstructor
@Slf4j
public class FirestorePointRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "points";

    /**
     * Buscar ponto por ID
     */
    public Optional<FirestorePoint> findById(String id) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return Optional.empty();
        }
        
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            
            if (document.exists()) {
                FirestorePoint point = document.toObject(FirestorePoint.class);
                if (point != null) {
                    point.setId(document.getId());
                }
                return Optional.ofNullable(point);
            }
            return Optional.empty();
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar ponto por ID {}: {}", id, e.getMessage());
            Thread.currentThread().interrupt();
            return Optional.empty();
        }
    }

    /**
     * Buscar ponto por código
     */
    public Optional<FirestorePoint> findByCode(String code) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return Optional.empty();
        }
        
        try {
            CollectionReference points = firestore.collection(COLLECTION_NAME);
            Query query = points.whereEqualTo("code", code);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            if (!documents.isEmpty()) {
                FirestorePoint point = documents.get(0).toObject(FirestorePoint.class);
                point.setId(documents.get(0).getId());
                return Optional.of(point);
            }
            return Optional.empty();
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar ponto por código {}: {}", code, e.getMessage());
            Thread.currentThread().interrupt();
            return Optional.empty();
        }
    }

    /**
     * Salvar ou atualizar ponto
     */
    public FirestorePoint save(FirestorePoint point) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return point;
        }
        
        try {
            if (point.getId() == null || point.getId().isEmpty()) {
                // Criar novo documento
                DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
                point.setId(docRef.getId());
                point.setCreatedAt(LocalDateTime.now());
            }
            point.setUpdatedAt(LocalDateTime.now());
            
            ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME)
                    .document(point.getId()).set(point);
            future.get();
            
            log.debug("Ponto salvo com sucesso: {}", point.getId());
            return point;
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao salvar ponto: {}", e.getMessage());
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao salvar ponto", e);
        }
    }

    /**
     * Deletar ponto por ID
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
            
            log.debug("Ponto deletado com sucesso: {}", id);
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao deletar ponto {}: {}", id, e.getMessage());
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao deletar ponto", e);
        }
    }

    /**
     * Listar todos os pontos
     */
    public List<FirestorePoint> findAll() {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return List.of();
        }
        
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            return documents.stream()
                    .map(doc -> {
                        FirestorePoint point = doc.toObject(FirestorePoint.class);
                        point.setId(doc.getId());
                        return point;
                    })
                    .collect(Collectors.toList());
                    
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao listar pontos: {}", e.getMessage());
            Thread.currentThread().interrupt();
            return List.of();
        }
    }

    /**
     * Buscar pontos por meridiano
     */
    public List<FirestorePoint> findByMeridian(String meridian) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return List.of();
        }
        
        try {
            CollectionReference points = firestore.collection(COLLECTION_NAME);
            Query query = points.whereEqualTo("meridian", meridian);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            return documents.stream()
                    .map(doc -> {
                        FirestorePoint point = doc.toObject(FirestorePoint.class);
                        point.setId(doc.getId());
                        return point;
                    })
                    .collect(Collectors.toList());
                    
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar pontos por meridiano {}: {}", meridian, e.getMessage());
            Thread.currentThread().interrupt();
            return List.of();
        }
    }

    /**
     * Buscar pontos por sintoma
     */
    public List<FirestorePoint> findBySymptomId(String symptomId) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return List.of();
        }
        
        try {
            CollectionReference points = firestore.collection(COLLECTION_NAME);
            Query query = points.whereArrayContains("symptomIds", symptomId);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            return documents.stream()
                    .map(doc -> {
                        FirestorePoint point = doc.toObject(FirestorePoint.class);
                        point.setId(doc.getId());
                        return point;
                    })
                    .collect(Collectors.toList());
                    
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar pontos por sintoma {}: {}", symptomId, e.getMessage());
            Thread.currentThread().interrupt();
            return List.of();
        }
    }

    /**
     * Buscar pontos por nome (busca parcial)
     */
    public List<FirestorePoint> findByNameContaining(String name) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return List.of();
        }
        
        try {
            // Firestore não suporta LIKE, então fazemos busca client-side
            // Para produção, considere usar Algolia ou Elasticsearch
            List<FirestorePoint> allPoints = findAll();
            return allPoints.stream()
                    .filter(point -> point.getName().toLowerCase().contains(name.toLowerCase()))
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            log.error("Erro ao buscar pontos por nome {}: {}", name, e.getMessage());
            return List.of();
        }
    }

    /**
     * Incrementar contador de favoritos
     */
    public void incrementFavoriteCount(String pointId) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return;
        }
        
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(pointId);
            ApiFuture<Void> future = firestore.runTransaction(transaction -> {
                DocumentSnapshot snapshot = transaction.get(docRef).get();
                if (snapshot.exists()) {
                    FirestorePoint point = snapshot.toObject(FirestorePoint.class);
                    Integer currentCount = point.getFavoriteCount();
                    int newCount = (currentCount != null ? currentCount : 0) + 1;
                    transaction.update(docRef, "favoriteCount", newCount);
                }
                return null;
            });
            future.get();
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao incrementar contador de favoritos para ponto {}: {}", pointId, e.getMessage());
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Decrementar contador de favoritos
     */
    public void decrementFavoriteCount(String pointId) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return;
        }
        
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(pointId);
            ApiFuture<Void> future = firestore.runTransaction(transaction -> {
                DocumentSnapshot snapshot = transaction.get(docRef).get();
                if (snapshot.exists()) {
                    FirestorePoint point = snapshot.toObject(FirestorePoint.class);
                    Integer currentCount = point.getFavoriteCount();
                    int newCount = Math.max(0, (currentCount != null ? currentCount : 0) - 1);
                    transaction.update(docRef, "favoriteCount", newCount);
                }
                return null;
            });
            future.get();
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao decrementar contador de favoritos para ponto {}: {}", pointId, e.getMessage());
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Verificar se existe ponto com código
     */
    public boolean existsByCode(String code) {
        return findByCode(code).isPresent();
    }

    /**
     * Contar total de pontos
     */
    public long count() {
        return findAll().size();
    }
}