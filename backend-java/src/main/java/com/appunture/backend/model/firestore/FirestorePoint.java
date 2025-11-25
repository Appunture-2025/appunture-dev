package com.appunture.backend.model.firestore;

import com.google.cloud.firestore.annotation.DocumentId;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(name = "FirestorePoint", description = "Representa um ponto de acupuntura armazenado no Firestore")
public class FirestorePoint {
    
    @DocumentId
    @Schema(description = "ID do documento Firestore", example = "VG20_DOC_123")
    private String id; // Firestore document ID
    
    @Schema(description = "Código do ponto (ex: VG20, E36)", example = "VG20")
    private String code; // Código do ponto (ex: VG20, E36)
    @Schema(description = "Nome popular do ponto", example = "Baihui (Hundred Meetings)")
    private String name; // Nome do ponto
    @Schema(description = "Descrição anatômica completa", example = "No ápice da cabeça, na interseção das linhas medianas")
    private String description; // Descrição detalhada
    @Schema(description = "Meridiano associado", example = "Du Mai")
    private String meridian; // Meridiano
    @Schema(description = "Localização anatômica sucinta", example = "Topo da cabeça, na linha média")
    private String location; // Localização anatômica
    @Schema(description = "Indicações terapêuticas principais", example = "Redução de ansiedade, clareza mental")
    private String indication; // Indicações terapêuticas
    
    // Coordenadas no mapa corporal como mapa
    @Schema(description = "Coordenadas normalizadas no mapa corporal", example = "{\"x\":0.45,\"y\":0.12}")
    private Map<String, Double> coordinates; // {x: 0.0, y: 0.0}
    
    // URLs de imagens no Firebase Storage
    @Schema(description = "URLs originais das imagens no Firebase Storage", example = "[\"https://storage.googleapis.com/appunture/points/vg20/raw.jpg\"]")
    private List<String> imageUrls;
    // Referência de thumbnails (imagem original -> thumbnail)
    @Schema(description = "Mapeamento de imagem original para thumbnail otimizado", example = "{\"https://.../raw.jpg\":\"https://.../raw_320.jpg\"}")
    private Map<String, String> imageThumbnailMap;
    // Metadados de auditoria para imagens
    @Schema(description = "Histórico de auditoria das operações de imagem")
    private List<ImageAuditEntry> imageAudit;
    
    // Sintomas relacionados (IDs dos documentos Symptom)
    @Schema(description = "IDs de sintomas associados", example = "[\"insomnia\",\"stress\"]")
    private List<String> symptomIds;
    
    // Metadados
    @Schema(description = "Data de criação", example = "2025-02-10T15:43:00")
    private LocalDateTime createdAt;
    @Schema(description = "Última atualização", example = "2025-03-01T09:12:11")
    private LocalDateTime updatedAt;
    @Schema(description = "UID Firebase do criador", example = "qwerty123456")
    private String createdBy; // ID do usuário que criou
    
    // Estatísticas de uso
    @Schema(description = "Quantidade de favoritos registrados", example = "42")
    private Integer favoriteCount; // Quantos usuários favoritaram
    @Schema(description = "Número de visualizações registradas", example = "230")
    private Integer viewCount; // Quantas vezes foi visualizado
    
    // Campos para busca e filtros
    @Schema(description = "Tags livres para facilitar buscas", example = "[\"calmante\",\"dormir\"]")
    private List<String> tags; // Tags para busca
    @Schema(description = "Categoria clínica", example = "Neuro")
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
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImageAuditEntry {
        @Schema(description = "Imagem afetada pela operação", example = "https://storage.googleapis.com/appunture/points/vg20/raw.jpg")
        private String imageUrl;
        @Schema(description = "Thumbnail registrado", example = "https://storage.googleapis.com/appunture/points/vg20/raw_320.jpg")
        private String thumbnailUrl;
        @Schema(description = "Tipo da operação", example = "ADDED")
        private String action; // ADDED, REMOVED, THUMBNAIL_GENERATED
        @Schema(description = "UID do usuário responsável", example = "uid_admin_01")
        private String performedBy;
        @Schema(description = "Email do usuário responsável", example = "admin@appunture.dev")
        private String performedByEmail;
        @Schema(description = "Timestamp da operação", example = "2025-03-01T09:15:00")
        private LocalDateTime timestamp;
        @Schema(description = "Notas/contexto adicional", example = "Upload realizado via painel web")
        private String notes;
    }
}