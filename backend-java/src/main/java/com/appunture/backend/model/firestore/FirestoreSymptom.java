package com.appunture.backend.model.firestore;

import com.google.cloud.firestore.annotation.DocumentId;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FirestoreSymptom {
    
    @DocumentId
    private String id; // Firestore document ID
    
    private String name; // Nome do sintoma
    private String description; // Descrição detalhada
    private String category; // Categoria (ex: "Dor", "Digestivo", "Emocional")
    private List<String> tags; // Tags para busca e classificação
    
    // Pontos relacionados (IDs dos documentos Point)
    private List<String> pointIds;
    
    // Metadados
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy; // ID do usuário que criou
    
    // Estatísticas de uso
    private Integer useCount; // Quantas vezes foi usado em buscas
    private Integer associatedPointsCount; // Quantos pontos estão associados
    
    // Severidade/Prioridade para ordenação
    private Integer severity; // 1-10, onde 10 é mais severo
    private Integer priority; // Para ordenação em listas
    
    // Método de conveniência para adicionar ponto
    public void addPointId(String pointId) {
        if (pointIds != null && !pointIds.contains(pointId)) {
            pointIds.add(pointId);
        }
    }
    
    // Método de conveniência para remover ponto
    public void removePointId(String pointId) {
        if (pointIds != null) {
            pointIds.remove(pointId);
        }
    }
    
    // Método para incrementar contador de uso
    public void incrementUseCount() {
        if (useCount == null) {
            useCount = 1;
        } else {
            useCount++;
        }
    }
}