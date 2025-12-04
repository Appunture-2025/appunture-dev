package com.appunture.backend.controller;

import com.appunture.backend.model.firestore.FirestoreSymptom;
import com.appunture.backend.service.FirestoreSymptomService;
import com.google.firebase.auth.FirebaseToken;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/symptoms")
@Tag(name = "Symptoms", description = "Symptoms operations (Firestore)")
@RequiredArgsConstructor
@Slf4j
public class FirestoreSymptomController {

    private final FirestoreSymptomService symptomService;

    @GetMapping
    @Operation(summary = "List all symptoms", description = "List all symptoms from Firestore")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<FirestoreSymptom>> getAllSymptoms() {
        try {
            List<FirestoreSymptom> symptoms = symptomService.findAll();
            log.debug("Retornando {} sintomas", symptoms.size());
            return ResponseEntity.ok(symptoms);
        } catch (Exception e) {
            log.error("Erro ao listar sintomas: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get symptom by ID", description = "Returns a specific symptom by Firestore document ID")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<FirestoreSymptom> getSymptomById(@PathVariable String id) {
        try {
            Optional<FirestoreSymptom> symptom = symptomService.findById(id);
            return symptom.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erro ao buscar sintoma {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Get symptom by name", description = "Returns a symptom by its exact name")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<FirestoreSymptom> getSymptomByName(@PathVariable String name) {
        try {
            Optional<FirestoreSymptom> symptom = symptomService.findByName(name);
            return symptom.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erro ao buscar sintoma por nome {}: {}", name, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "List symptoms by category", description = "Returns all symptoms of a specific category")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<FirestoreSymptom>> getSymptomsByCategory(@PathVariable String category) {
        try {
            List<FirestoreSymptom> symptoms = symptomService.findByCategory(category);
            log.debug("Retornando {} sintomas da categoria {}", symptoms.size(), category);
            return ResponseEntity.ok(symptoms);
        } catch (Exception e) {
            log.error("Erro ao buscar sintomas por categoria {}: {}", category, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/point/{pointId}")
    @Operation(summary = "List symptoms by point", description = "Returns all symptoms associated with a point")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<FirestoreSymptom>> getSymptomsByPoint(@PathVariable String pointId) {
        try {
            List<FirestoreSymptom> symptoms = symptomService.findByPointId(pointId);
            log.debug("Retornando {} sintomas para ponto {}", symptoms.size(), pointId);
            return ResponseEntity.ok(symptoms);
        } catch (Exception e) {
            log.error("Erro ao buscar sintomas por ponto {}: {}", pointId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search symptoms by name", description = "Search symptoms by partial name match")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<FirestoreSymptom>> searchSymptomsByName(@RequestParam String name) {
        try {
            List<FirestoreSymptom> symptoms = symptomService.findByNameContaining(name);
            log.debug("Busca por '{}' retornou {} sintomas", name, symptoms.size());
            return ResponseEntity.ok(symptoms);
        } catch (Exception e) {
            log.error("Erro ao buscar sintomas por nome {}: {}", name, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/tag/{tag}")
    @Operation(summary = "List symptoms by tag", description = "Returns all symptoms with a specific tag")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<FirestoreSymptom>> getSymptomsByTag(@PathVariable String tag) {
        try {
            List<FirestoreSymptom> symptoms = symptomService.findByTag(tag);
            log.debug("Retornando {} sintomas com tag {}", symptoms.size(), tag);
            return ResponseEntity.ok(symptoms);
        } catch (Exception e) {
            log.error("Erro ao buscar sintomas por tag {}: {}", tag, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/severity")
    @Operation(summary = "List symptoms by severity", description = "Returns symptoms filtered by severity range")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<FirestoreSymptom>> getSymptomsBySeverity(
            @RequestParam(defaultValue = "1") int minSeverity,
            @RequestParam(defaultValue = "10") int maxSeverity) {
        try {
            List<FirestoreSymptom> symptoms = symptomService.findBySeverity(minSeverity, maxSeverity);
            log.debug("Retornando {} sintomas com severidade {}-{}", symptoms.size(), minSeverity, maxSeverity);
            return ResponseEntity.ok(symptoms);
        } catch (Exception e) {
            log.error("Erro ao buscar sintomas por severidade: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/popular")
    @Operation(summary = "Get most used symptoms", description = "Returns most frequently used symptoms")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<FirestoreSymptom>> getPopularSymptoms(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<FirestoreSymptom> symptoms = symptomService.findTopUsed(limit);
            log.debug("Retornando {} sintomas mais usados", symptoms.size());
            return ResponseEntity.ok(symptoms);
        } catch (Exception e) {
            log.error("Erro ao buscar sintomas populares: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    @Operation(summary = "Create symptom", description = "Creates a new symptom (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FirestoreSymptom> createSymptom(
            @AuthenticationPrincipal FirebaseToken token,
            @RequestBody FirestoreSymptom symptom) {
        try {
            log.debug("Criando novo sintoma: {}", symptom.getName());
            symptom.setCreatedBy(token.getUid());
            FirestoreSymptom createdSymptom = symptomService.createSymptom(symptom);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSymptom);
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao criar sintoma: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao criar sintoma: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update symptom", description = "Updates an existing symptom (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FirestoreSymptom> updateSymptom(
            @PathVariable String id,
            @RequestBody FirestoreSymptom updates) {
        try {
            log.debug("Atualizando sintoma: {}", id);
            FirestoreSymptom updatedSymptom = symptomService.updateSymptom(id, updates);
            return ResponseEntity.ok(updatedSymptom);
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao atualizar sintoma {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar sintoma {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete symptom", description = "Deletes a symptom (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSymptom(@PathVariable String id) {
        try {
            log.debug("Deletando sintoma: {}", id);
            symptomService.deleteSymptom(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("Sintoma não encontrado para deletar: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao deletar sintoma {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{symptomId}/points/{pointId}")
    @Operation(summary = "Associate point to symptom", description = "Associates a point with a symptom (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> addPointToSymptom(
            @PathVariable String symptomId,
            @PathVariable String pointId) {
        try {
            log.debug("Associando ponto {} ao sintoma {}", pointId, symptomId);
            symptomService.addPointToSymptom(symptomId, pointId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao associar ponto {} ao sintoma {}: {}", pointId, symptomId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao associar ponto {} ao sintoma {}: {}", pointId, symptomId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{symptomId}/points/{pointId}")
    @Operation(summary = "Remove point from symptom", description = "Removes point association from symptom (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removePointFromSymptom(
            @PathVariable String symptomId,
            @PathVariable String pointId) {
        try {
            log.debug("Removendo associação do ponto {} do sintoma {}", pointId, symptomId);
            symptomService.removePointFromSymptom(symptomId, pointId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao remover ponto {} do sintoma {}: {}", pointId, symptomId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao remover ponto {} do sintoma {}: {}", pointId, symptomId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{symptomId}/tags")
    @Operation(summary = "Add tag to symptom", description = "Adds a tag to a symptom (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> addTagToSymptom(
            @PathVariable String symptomId,
            @RequestBody Map<String, String> request) {
        try {
            String tag = request.get("tag");
            if (tag == null || tag.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            log.debug("Adicionando tag '{}' ao sintoma {}", tag, symptomId);
            symptomService.addTagToSymptom(symptomId, tag);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao adicionar tag ao sintoma {}: {}", symptomId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao adicionar tag ao sintoma {}: {}", symptomId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/use")
    @Operation(summary = "Increment use count", description = "Increments the usage counter for a symptom")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<Void> incrementUseCount(@PathVariable String id) {
        try {
            log.debug("Incrementando contador de uso do sintoma: {}", id);
            symptomService.incrementUseCount(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erro ao incrementar contador de uso do sintoma {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all categories", description = "Returns list of unique symptom categories")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<String>> getCategories() {
        try {
            List<String> categories = symptomService.findUniqueCategories();
            log.debug("Retornando {} categorias únicas", categories.size());
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Erro ao obter categorias: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/tags")
    @Operation(summary = "Get all tags", description = "Returns list of unique symptom tags")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<String>> getTags() {
        try {
            List<String> tags = symptomService.findUniqueTags();
            log.debug("Retornando {} tags únicas", tags.size());
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            log.error("Erro ao obter tags: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stats")
    @Operation(summary = "Get symptoms statistics", description = "Returns general statistics about symptoms")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<Map<String, Object>> getSymptomsStats() {
        try {
            long totalSymptoms = symptomService.count();
            List<FirestoreSymptom> popularSymptoms = symptomService.findTopUsed(5);
            List<String> categories = symptomService.findUniqueCategories();
            
            Map<String, Object> stats = Map.of(
                "totalSymptoms", totalSymptoms,
                "popularSymptoms", popularSymptoms,
                "totalCategories", categories.size(),
                "categories", categories
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Erro ao obter estatísticas dos sintomas: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}