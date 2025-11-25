package com.appunture.backend.controller;

import com.appunture.backend.dto.point.PointImageRemovalRequest;
import com.appunture.backend.dto.point.PointImageRequest;
import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.service.FirestorePointService;
import com.google.firebase.auth.FirebaseToken;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

/**
 * Controller para pontos de acupuntura usando Firestore
 */
@RestController
@RequestMapping("/points")
@Tag(name = "Points", description = "Acupuncture points operations (Firestore)")
@RequiredArgsConstructor
@Slf4j
public class FirestorePointController {

    private final FirestorePointService pointService;

    @GetMapping
    @Operation(summary = "List all points", description = "List all acupuncture points from Firestore")
    @SecurityRequirement(name = "firebase")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista completa de pontos",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = FirestorePoint.class)))),
        @ApiResponse(responseCode = "500", description = "Erro inesperado")
    })
    public ResponseEntity<List<FirestorePoint>> getAllPoints() {
        try {
            List<FirestorePoint> points = pointService.findAll();
            log.debug("Retornando {} pontos", points.size());
            return ResponseEntity.ok(points);
        } catch (Exception e) {
            log.error("Erro ao listar pontos: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get point by ID", description = "Returns a specific point by Firestore document ID")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<FirestorePoint> getPointById(@PathVariable String id) {
        try {
            Optional<FirestorePoint> point = pointService.findById(id);
            return point.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erro ao buscar ponto {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get point by code", description = "Returns a point by its code (e.g., VG20)")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<FirestorePoint> getPointByCode(@PathVariable String code) {
        try {
            Optional<FirestorePoint> point = pointService.findByCode(code);
            return point.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erro ao buscar ponto por código {}: {}", code, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/meridian/{meridian}")
    @Operation(summary = "List points by meridian", description = "Returns all points of a specific meridian")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<FirestorePoint>> getPointsByMeridian(@PathVariable String meridian) {
        try {
            List<FirestorePoint> points = pointService.findByMeridian(meridian);
            log.debug("Retornando {} pontos do meridiano {}", points.size(), meridian);
            return ResponseEntity.ok(points);
        } catch (Exception e) {
            log.error("Erro ao buscar pontos por meridiano {}: {}", meridian, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/symptom/{symptomId}")
    @Operation(summary = "List points by symptom", description = "Returns all points associated with a symptom")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<FirestorePoint>> getPointsBySymptom(@PathVariable String symptomId) {
        try {
            List<FirestorePoint> points = pointService.findBySymptomId(symptomId);
            log.debug("Retornando {} pontos para sintoma {}", points.size(), symptomId);
            return ResponseEntity.ok(points);
        } catch (Exception e) {
            log.error("Erro ao buscar pontos por sintoma {}: {}", symptomId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search points by name", description = "Search points by partial name match")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<FirestorePoint>> searchPointsByName(@RequestParam String name) {
        try {
            List<FirestorePoint> points = pointService.findByNameContaining(name);
            log.debug("Busca por '{}' retornou {} pontos", name, points.size());
            return ResponseEntity.ok(points);
        } catch (Exception e) {
            log.error("Erro ao buscar pontos por nome {}: {}", name, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular points", description = "Returns most favorited points")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<List<FirestorePoint>> getPopularPoints(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<FirestorePoint> points = pointService.findPopularPoints(limit);
            log.debug("Retornando {} pontos populares", points.size());
            return ResponseEntity.ok(points);
        } catch (Exception e) {
            log.error("Erro ao buscar pontos populares: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    @Operation(summary = "Create point", description = "Creates a new acupuncture point (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FirestorePoint> createPoint(
            @AuthenticationPrincipal FirebaseToken token,
            @RequestBody FirestorePoint point) {
        try {
            log.debug("Criando novo ponto: {}", point.getCode());
            point.setCreatedBy(token.getUid());
            FirestorePoint createdPoint = pointService.createPoint(point);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPoint);
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao criar ponto: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao criar ponto: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update point", description = "Updates an existing point (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FirestorePoint> updatePoint(
            @PathVariable String id,
            @RequestBody FirestorePoint updates) {
        try {
            log.debug("Atualizando ponto: {}", id);
            FirestorePoint updatedPoint = pointService.updatePoint(id, updates);
            return ResponseEntity.ok(updatedPoint);
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao atualizar ponto {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar ponto {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete point", description = "Deletes a point (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePoint(@PathVariable String id) {
        try {
            log.debug("Deletando ponto: {}", id);
            pointService.deletePoint(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("Ponto não encontrado para deletar: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erro ao deletar ponto {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{pointId}/symptoms/{symptomId}")
    @Operation(summary = "Associate symptom to point", description = "Associates a symptom with a point (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> addSymptomToPoint(
            @PathVariable String pointId,
            @PathVariable String symptomId) {
        try {
            log.debug("Associando sintoma {} ao ponto {}", symptomId, pointId);
            pointService.addSymptomToPoint(pointId, symptomId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao associar sintoma {} ao ponto {}: {}", symptomId, pointId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao associar sintoma {} ao ponto {}: {}", symptomId, pointId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{pointId}/symptoms/{symptomId}")
    @Operation(summary = "Remove symptom from point", description = "Removes symptom association from point (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeSymptomFromPoint(
            @PathVariable String pointId,
            @PathVariable String symptomId) {
        try {
            log.debug("Removendo associação do sintoma {} do ponto {}", symptomId, pointId);
            pointService.removeSymptomFromPoint(pointId, symptomId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao remover sintoma {} do ponto {}: {}", symptomId, pointId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao remover sintoma {} do ponto {}: {}", symptomId, pointId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{pointId}/images")
    @Operation(summary = "Add image to point", description = "Adds an image URL to a point (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Payload contendo URL da imagem e opções de thumbnail",
        required = true,
        content = @Content(schema = @Schema(implementation = PointImageRequest.class))
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Ponto atualizado",
            content = @Content(schema = @Schema(implementation = FirestorePoint.class))),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "500", description = "Erro inesperado")
    })
    public ResponseEntity<FirestorePoint> addImageToPoint(
            @PathVariable String pointId,
            @AuthenticationPrincipal FirebaseToken token,
            @Valid @RequestBody PointImageRequest request) {
        try {
            String actorId = token != null ? token.getUid() : "system";
            String actorEmail = token != null ? token.getEmail() : null;
            
            log.info("AUDIT: User={} Action=ADD_IMAGE Resource={} Image={}", 
                    actorEmail != null ? actorEmail : actorId, pointId, request.getImageUrl());
            
            FirestorePoint updatedPoint = pointService.addImageToPoint(
                    pointId,
                    request.getImageUrl(),
                    actorId,
                    actorEmail,
                    request.getNotes(),
                    Boolean.TRUE.equals(request.getGenerateThumbnail()),
                    request.getThumbnailUrl()
            );
            return ResponseEntity.ok(updatedPoint);
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao adicionar imagem ao ponto {}: {}", pointId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao adicionar imagem ao ponto {}: {}", pointId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{pointId}/images")
    @Operation(summary = "Remove image from point", description = "Remove uma imagem do ponto registrando auditoria (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Payload indicando a imagem que deve ser removida",
        required = true,
        content = @Content(schema = @Schema(implementation = PointImageRemovalRequest.class))
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Ponto atualizado",
            content = @Content(schema = @Schema(implementation = FirestorePoint.class))),
        @ApiResponse(responseCode = "400", description = "Imagem inexistente ou payload inválido"),
        @ApiResponse(responseCode = "500", description = "Erro inesperado")
    })
    public ResponseEntity<FirestorePoint> removeImageFromPoint(
            @PathVariable String pointId,
            @AuthenticationPrincipal FirebaseToken token,
            @Valid @RequestBody PointImageRemovalRequest request) {
        try {
            String actorId = token != null ? token.getUid() : "system";
            String actorEmail = token != null ? token.getEmail() : null;

            log.info("AUDIT: User={} Action=REMOVE_IMAGE Resource={} Image={} Reason={}", 
                    actorEmail != null ? actorEmail : actorId, pointId, request.getImageUrl(), request.getReason());

            FirestorePoint updatedPoint = pointService.removeImageFromPoint(
                    pointId,
                    request.getImageUrl(),
                    actorId,
                    actorEmail,
                    request.getReason()
            );
            return ResponseEntity.ok(updatedPoint);
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao remover imagem do ponto {}: {}", pointId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao remover imagem do ponto {}: {}", pointId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{pointId}/coordinates")
    @Operation(summary = "Update point coordinates", description = "Updates point coordinates on body map (Admin only)")
    @SecurityRequirement(name = "firebase")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updatePointCoordinates(
            @PathVariable String pointId,
            @RequestBody Map<String, Double> coordinates) {
        try {
            Double x = coordinates.get("x");
            Double y = coordinates.get("y");
            
            if (x == null || y == null) {
                return ResponseEntity.badRequest().build();
            }
            
            log.debug("Atualizando coordenadas do ponto {}: x={}, y={}", pointId, x, y);
            pointService.updatePointCoordinates(pointId, x, y);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao atualizar coordenadas do ponto {}: {}", pointId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar coordenadas do ponto {}: {}", pointId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stats")
    @Operation(summary = "Get points statistics", description = "Returns general statistics about points")
    @SecurityRequirement(name = "firebase")
    public ResponseEntity<Map<String, Object>> getPointsStats() {
        try {
            long totalPoints = pointService.count();
            List<FirestorePoint> popularPoints = pointService.findPopularPoints(5);
            
            Map<String, Object> stats = Map.of(
                "totalPoints", totalPoints,
                "popularPoints", popularPoints
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Erro ao obter estatísticas dos pontos: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}