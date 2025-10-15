package com.appunture.backend.model.firestore;

import com.google.cloud.firestore.annotation.DocumentId;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Modelo Firestore para pontos de acupuntura
 * Substitui a entidade JPA Point
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FirestorePoint {
    
    @DocumentId
    private String id; // Firestore document ID
    
    private String code; // Código do ponto (ex: VG20, E36)
    private String name; // Nome do ponto
    private String description; // Descrição detalhada
    private String meridian; // Meridiano
    private String location; // Localização anatômica
    private String indication; // Indicações terapêuticas
    
    // Coordenadas no mapa corporal como mapa
    private Map<String, Double> coordinates; // {x: 0.0, y: 0.0}
    
    // URLs de imagens no Firebase Storage
    private List<String> imageUrls;
    
    // Sintomas relacionados (IDs dos documentos Symptom)
    private List<String> symptomIds;
    
    // Metadados
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy; // ID do usuário que criou
    
    // Estatísticas de uso
    private Integer favoriteCount; // Quantos usuários favoritaram
    private Integer viewCount; // Quantas vezes foi visualizado
    
    // Campos para busca e filtros
    private List<String> tags; // Tags para busca
    private String category; // Categoria do ponto
    
    // Método de conveniência para adicionar sintoma
    public void addSymptomId(String symptomId) {
        if (symptomIds != null && !symptomIds.contains(symptomId)) {
            symptomIds.add(symptomId);
        }
    }
    
    // Método de conveniência para remover sintoma
    public void removeSymptomId(String symptomId) {
        if (symptomIds != null) {
            symptomIds.remove(symptomId);
        }
    }
}