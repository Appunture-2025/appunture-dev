package com.appunture.backend.repository.firestore;

import com.appunture.backend.model.firestore.FirestoreUser;
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
 * Repository para operações CRUD com usuários no Firestore
 */
@Repository
@RequiredArgsConstructor
@Slf4j
public class FirestoreUserRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "users";

    /**
     * Buscar usuário por ID do documento Firestore
     */
    public Optional<FirestoreUser> findById(String id) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return Optional.empty();
        }
        
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            
            if (document.exists()) {
                FirestoreUser user = document.toObject(FirestoreUser.class);
                if (user != null) {
                    user.setId(document.getId()); // Garantir que o ID está definido
                }
                return Optional.ofNullable(user);
            }
            return Optional.empty();
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar usuário por ID {}: {}", id, e.getMessage());
            Thread.currentThread().interrupt();
            return Optional.empty();
        }
    }

    /**
     * Buscar usuário por UID do Firebase Auth
     */
    public Optional<FirestoreUser> findByFirebaseUid(String firebaseUid) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return Optional.empty();
        }
        
        try {
            CollectionReference users = firestore.collection(COLLECTION_NAME);
            Query query = users.whereEqualTo("firebaseUid", firebaseUid);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            if (!documents.isEmpty()) {
                FirestoreUser user = documents.get(0).toObject(FirestoreUser.class);
                user.setId(documents.get(0).getId());
                return Optional.of(user);
            }
            return Optional.empty();
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar usuário por Firebase UID {}: {}", firebaseUid, e.getMessage());
            Thread.currentThread().interrupt();
            return Optional.empty();
        }
    }

    /**
     * Buscar usuário por email
     */
    public Optional<FirestoreUser> findByEmail(String email) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return Optional.empty();
        }
        
        try {
            CollectionReference users = firestore.collection(COLLECTION_NAME);
            Query query = users.whereEqualTo("email", email);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            if (!documents.isEmpty()) {
                FirestoreUser user = documents.get(0).toObject(FirestoreUser.class);
                user.setId(documents.get(0).getId());
                return Optional.of(user);
            }
            return Optional.empty();
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar usuário por email {}: {}", email, e.getMessage());
            Thread.currentThread().interrupt();
            return Optional.empty();
        }
    }

    /**
     * Salvar ou atualizar usuário
     */
    public FirestoreUser save(FirestoreUser user) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return user;
        }
        
        try {
            if (user.getId() == null || user.getId().isEmpty()) {
                // Criar novo documento com ID gerado automaticamente
                DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
                user.setId(docRef.getId());
                user.setCreatedAt(LocalDateTime.now());
            }
            user.setUpdatedAt(LocalDateTime.now());
            
            ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME)
                    .document(user.getId()).set(user);
            future.get();
            
            log.debug("Usuário salvo com sucesso: {}", user.getId());
            return user;
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao salvar usuário: {}", e.getMessage());
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao salvar usuário", e);
        }
    }

    /**
     * Deletar usuário por ID
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
            
            log.debug("Usuário deletado com sucesso: {}", id);
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao deletar usuário {}: {}", id, e.getMessage());
            Thread.currentThread().interrupt();
            throw new RuntimeException("Falha ao deletar usuário", e);
        }
    }

    /**
     * Listar todos os usuários
     */
    public List<FirestoreUser> findAll() {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return List.of();
        }
        
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            return documents.stream()
                    .map(doc -> {
                        FirestoreUser user = doc.toObject(FirestoreUser.class);
                        user.setId(doc.getId());
                        return user;
                    })
                    .collect(Collectors.toList());
                    
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao listar usuários: {}", e.getMessage());
            Thread.currentThread().interrupt();
            return List.of();
        }
    }

    /**
     * Verificar se existe usuário com Firebase UID
     */
    public boolean existsByFirebaseUid(String firebaseUid) {
        return findByFirebaseUid(firebaseUid).isPresent();
    }

    /**
     * Verificar se existe usuário com email
     */
    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }

    /**
     * Buscar usuários por role
     */
    public List<FirestoreUser> findByRole(String role) {
        if (firestore == null) {
            log.warn("Firestore não inicializado");
            return List.of();
        }
        
        try {
            CollectionReference users = firestore.collection(COLLECTION_NAME);
            Query query = users.whereEqualTo("role", role);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            return documents.stream()
                    .map(doc -> {
                        FirestoreUser user = doc.toObject(FirestoreUser.class);
                        user.setId(doc.getId());
                        return user;
                    })
                    .collect(Collectors.toList());
                    
        } catch (InterruptedException | ExecutionException e) {
            log.error("Erro ao buscar usuários por role {}: {}", role, e.getMessage());
            Thread.currentThread().interrupt();
            return List.of();
        }
    }

    /**
     * Contar total de usuários
     */
    public long count() {
        return findAll().size();
    }
}