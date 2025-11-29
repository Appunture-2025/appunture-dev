package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.model.firestore.FirestorePoint.ImageAuditEntry;
import com.appunture.backend.repository.firestore.FirestorePointRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service responsible for managing acupuncture points in Firestore.
 * 
 * <p>Handles all CRUD operations and search functionality for acupuncture points,
 * including management of images with audit trail and favorite count tracking.</p>
 * 
 * <h2>Main Features:</h2>
 * <ul>
 *   <li>CRUD operations for points</li>
 *   <li>Search by code, meridian, symptom, and name</li>
 *   <li>Image management with thumbnails and audit log</li>
 *   <li>Favorite count tracking</li>
 *   <li>Popular points retrieval</li>
 * </ul>
 * 
 * @see FirestorePoint
 * @see FirestorePointRepository
 * @see ThumbnailGenerationService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FirestorePointService {

    private final FirestorePointRepository pointRepository;
    private final ThumbnailGenerationService thumbnailGenerationService;
    private static final int MAX_AUDIT_ENTRIES = 50;

    /**
     * Retrieves a point by its Firestore document ID.
     *
     * @param id The Firestore document ID
     * @return Optional containing the point if found, empty otherwise
     */
    public Optional<FirestorePoint> findById(String id) {
        log.debug("Buscando ponto por ID: {}", id);
        return pointRepository.findById(id);
    }

    /**
     * Retrieves a point by its unique acupuncture code.
     *
     * @param code The point code (e.g., "VG20", "ST36", "LU-1")
     * @return Optional containing the point if found, empty otherwise
     */
    public Optional<FirestorePoint> findByCode(String code) {
        log.debug("Buscando ponto por código: {}", code);
        return pointRepository.findByCode(code);
    }

    /**
     * Retrieves all acupuncture points from the database.
     *
     * @return List of all points (may be empty if none exist)
     */
    public List<FirestorePoint> findAll() {
        log.debug("Listando todos os pontos");
        return pointRepository.findAll();
    }

    /**
     * Retrieves all points belonging to a specific meridian.
     *
     * @param meridian The meridian code (e.g., "LU", "ST", "GV")
     * @return List of points in the specified meridian
     */
    public List<FirestorePoint> findByMeridian(String meridian) {
        log.debug("Buscando pontos por meridiano: {}", meridian);
        return pointRepository.findByMeridian(meridian);
    }

    /**
     * Retrieves all points associated with a specific symptom.
     *
     * @param symptomId The symptom's Firestore document ID
     * @return List of points that can treat the specified symptom
     */
    public List<FirestorePoint> findBySymptomId(String symptomId) {
        log.debug("Buscando pontos por sintoma: {}", symptomId);
        return pointRepository.findBySymptomId(symptomId);
    }

    /**
     * Searches points by partial name match (case-insensitive).
     *
     * @param name The search term to match against point names
     * @return List of points with names containing the search term
     */
    public List<FirestorePoint> findByNameContaining(String name) {
        log.debug("Buscando pontos por nome: {}", name);
        return pointRepository.findByNameContaining(name);
    }

    /**
     * Creates a new acupuncture point.
     *
     * @param point The point entity to create (code must be unique)
     * @return The created point with generated Firestore ID
     * @throws IllegalArgumentException if a point with the same code already exists
     */
    public FirestorePoint createPoint(FirestorePoint point) {
        log.debug("Criando novo ponto: {}", point.getCode());
        
        if (point.getCode() != null && pointRepository.existsByCode(point.getCode())) {
            throw new IllegalArgumentException("Já existe um ponto com o código: " + point.getCode());
        }

        point.setCreatedAt(LocalDateTime.now());
        point.setUpdatedAt(LocalDateTime.now());
        
        if (point.getFavoriteCount() == null) {
            point.setFavoriteCount(0);
        }
        if (point.getViewCount() == null) {
            point.setViewCount(0);
        }

        return pointRepository.save(point);
    }

    /**
     * Updates an existing acupuncture point.
     * Only non-null fields in the updates object will be applied.
     *
     * @param id The Firestore document ID of the point to update
     * @param updates The point entity containing fields to update
     * @return The updated point
     * @throws IllegalArgumentException if point not found or new code already exists
     */
    public FirestorePoint updatePoint(String id, FirestorePoint updates) {
        log.debug("Atualizando ponto: {}", id);
        
        Optional<FirestorePoint> existing = pointRepository.findById(id);
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("Ponto não encontrado: " + id);
        }

        FirestorePoint point = existing.get();
        
        // Atualizar apenas campos não nulos
        if (updates.getCode() != null && !updates.getCode().equals(point.getCode())) {
            if (pointRepository.existsByCode(updates.getCode())) {
                throw new IllegalArgumentException("Já existe um ponto com o código: " + updates.getCode());
            }
            point.setCode(updates.getCode());
        }
        if (updates.getName() != null) {
            point.setName(updates.getName());
        }
        if (updates.getDescription() != null) {
            point.setDescription(updates.getDescription());
        }
        if (updates.getMeridian() != null) {
            point.setMeridian(updates.getMeridian());
        }
        if (updates.getLocation() != null) {
            point.setLocation(updates.getLocation());
        }
        if (updates.getIndication() != null) {
            point.setIndication(updates.getIndication());
        }
        if (updates.getCoordinates() != null) {
            point.setCoordinates(updates.getCoordinates());
        }
        if (updates.getImageUrls() != null) {
            point.setImageUrls(updates.getImageUrls());
        }
        if (updates.getImageThumbnailMap() != null) {
            point.setImageThumbnailMap(updates.getImageThumbnailMap());
        }
        if (updates.getImageAudit() != null) {
            point.setImageAudit(updates.getImageAudit());
        }
        if (updates.getSymptomIds() != null) {
            point.setSymptomIds(updates.getSymptomIds());
        }
        if (updates.getTags() != null) {
            point.setTags(updates.getTags());
        }
        if (updates.getCategory() != null) {
            point.setCategory(updates.getCategory());
        }
        
        point.setUpdatedAt(LocalDateTime.now());

        return pointRepository.save(point);
    }

    /**
     * Deletes an acupuncture point.
     *
     * @param id The Firestore document ID of the point to delete
     * @throws IllegalArgumentException if point not found
     */
    public void deletePoint(String id) {
        log.debug("Deletando ponto: {}", id);
        
        Optional<FirestorePoint> point = pointRepository.findById(id);
        if (point.isEmpty()) {
            throw new IllegalArgumentException("Ponto não encontrado: " + id);
        }

        pointRepository.deleteById(id);
        log.info("Ponto deletado com sucesso: {}", id);
    }

    /**
     * Associates a symptom with an acupuncture point.
     *
     * @param pointId The Firestore document ID of the point
     * @param symptomId The Firestore document ID of the symptom to associate
     * @throws IllegalArgumentException if point not found
     */
    public void addSymptomToPoint(String pointId, String symptomId) {
        log.debug("Adicionando sintoma {} ao ponto {}", symptomId, pointId);
        
        Optional<FirestorePoint> pointOpt = pointRepository.findById(pointId);
        if (pointOpt.isEmpty()) {
            throw new IllegalArgumentException("Ponto não encontrado: " + pointId);
        }

        FirestorePoint point = pointOpt.get();
        point.addSymptomId(symptomId);
        point.setUpdatedAt(LocalDateTime.now());

        pointRepository.save(point);
        log.debug("Sintoma adicionado ao ponto com sucesso");
    }

    /**
     * Removes a symptom association from an acupuncture point.
     *
     * @param pointId The Firestore document ID of the point
     * @param symptomId The Firestore document ID of the symptom to remove
     * @throws IllegalArgumentException if point not found
     */
    public void removeSymptomFromPoint(String pointId, String symptomId) {
        log.debug("Removendo sintoma {} do ponto {}", symptomId, pointId);
        
        Optional<FirestorePoint> pointOpt = pointRepository.findById(pointId);
        if (pointOpt.isEmpty()) {
            throw new IllegalArgumentException("Ponto não encontrado: " + pointId);
        }

        FirestorePoint point = pointOpt.get();
        point.removeSymptomId(symptomId);
        point.setUpdatedAt(LocalDateTime.now());

        pointRepository.save(point);
        log.debug("Sintoma removido do ponto com sucesso");
    }

    /**
     * Adds an image to a point with optional thumbnail generation and audit logging.
     *
     * @param pointId The Firestore document ID of the point
     * @param imageUrl The URL of the image to add
     * @param performedBy The user ID who performed this action
     * @param performedByEmail The email of the user who performed this action
     * @param notes Optional notes about this image addition
     * @param generateThumbnail Whether to auto-generate a thumbnail
     * @param providedThumbnailUrl Optional pre-generated thumbnail URL
     * @return The updated point with the new image
     * @throws IllegalArgumentException if point not found
     */
    public FirestorePoint addImageToPoint(String pointId,
                                          String imageUrl,
                                          String performedBy,
                                          String performedByEmail,
                                          String notes,
                                          boolean generateThumbnail,
                                          String providedThumbnailUrl) {
        log.debug("Adicionando imagem {} ao ponto {}", imageUrl, pointId);

        FirestorePoint point = pointRepository.findById(pointId)
                .orElseThrow(() -> new IllegalArgumentException("Ponto não encontrado: " + pointId));

        List<String> imageUrls = ensureMutableList(point.getImageUrls());
        if (!imageUrls.contains(imageUrl)) {
            imageUrls.add(imageUrl);
        }
        point.setImageUrls(imageUrls);

        Map<String, String> thumbnailMap = ensureMutableMap(point.getImageThumbnailMap());
        thumbnailGenerationService.resolveThumbnail(imageUrl, generateThumbnail, providedThumbnailUrl)
                .ifPresent(thumbnailUrl -> thumbnailMap.put(imageUrl, thumbnailUrl));
        if (!thumbnailMap.isEmpty()) {
            point.setImageThumbnailMap(thumbnailMap);
        }

        appendImageAuditEntry(point, imageUrl, thumbnailMap.get(imageUrl), "ADDED", performedBy, performedByEmail, notes);
        point.setUpdatedAt(LocalDateTime.now());

        FirestorePoint saved = pointRepository.save(point);
        log.info("Imagem {} adicionada ao ponto {} por {}", imageUrl, pointId, performedBy);
        return saved;
    }

    /**
     * Removes an image from a point with audit logging.
     *
     * @param pointId The Firestore document ID of the point
     * @param imageUrl The URL of the image to remove
     * @param performedBy The user ID who performed this action
     * @param performedByEmail The email of the user who performed this action
     * @param notes Optional notes about this image removal
     * @return The updated point without the removed image
     * @throws IllegalArgumentException if point or image not found
     */
    public FirestorePoint removeImageFromPoint(String pointId,
                                               String imageUrl,
                                               String performedBy,
                                               String performedByEmail,
                                               String notes) {
        log.debug("Removendo imagem {} do ponto {}", imageUrl, pointId);

        FirestorePoint point = pointRepository.findById(pointId)
                .orElseThrow(() -> new IllegalArgumentException("Ponto não encontrado: " + pointId));

        List<String> imageUrls = ensureMutableList(point.getImageUrls());
        boolean removed = imageUrls.remove(imageUrl);
        if (!removed) {
            throw new IllegalArgumentException("Imagem não encontrada no ponto: " + imageUrl);
        }
        point.setImageUrls(imageUrls);

        Map<String, String> thumbnailMap = ensureMutableMap(point.getImageThumbnailMap());
        thumbnailMap.remove(imageUrl);
        point.setImageThumbnailMap(thumbnailMap.isEmpty() ? null : thumbnailMap);

        appendImageAuditEntry(point, imageUrl, null, "REMOVED", performedBy, performedByEmail, notes);
        point.setUpdatedAt(LocalDateTime.now());

        FirestorePoint saved = pointRepository.save(point);
        log.info("Imagem {} removida do ponto {} por {}", imageUrl, pointId, performedBy);
        return saved;
    }

    private void appendImageAuditEntry(FirestorePoint point,
                                       String imageUrl,
                                       String thumbnailUrl,
                                       String action,
                                       String performedBy,
                                       String performedByEmail,
                                       String notes) {
        List<ImageAuditEntry> auditEntries = ensureMutableAudit(point.getImageAudit());
        auditEntries.add(ImageAuditEntry.builder()
                .imageUrl(imageUrl)
                .thumbnailUrl(thumbnailUrl)
                .action(action)
                .performedBy(performedBy)
                .performedByEmail(performedByEmail)
                .timestamp(LocalDateTime.now())
                .notes(notes)
                .build());
        if (auditEntries.size() > MAX_AUDIT_ENTRIES) {
            auditEntries.remove(0);
        }
        point.setImageAudit(auditEntries);
    }

    private List<String> ensureMutableList(List<String> source) {
        return source == null ? new ArrayList<>() : new ArrayList<>(source);
    }

    private Map<String, String> ensureMutableMap(Map<String, String> source) {
        return source == null ? new HashMap<>() : new HashMap<>(source);
    }

    private List<ImageAuditEntry> ensureMutableAudit(List<ImageAuditEntry> source) {
        return source == null ? new ArrayList<>() : new ArrayList<>(source);
    }

    /**
     * Updates the coordinates of an acupuncture point on the body map.
     *
     * @param pointId The Firestore document ID of the point
     * @param x The horizontal coordinate (0.0 to 1.0)
     * @param y The vertical coordinate (0.0 to 1.0)
     * @throws IllegalArgumentException if point not found
     */
    public void updatePointCoordinates(String pointId, double x, double y) {
        log.debug("Atualizando coordenadas do ponto: {}", pointId);
        
        Optional<FirestorePoint> pointOpt = pointRepository.findById(pointId);
        if (pointOpt.isEmpty()) {
            throw new IllegalArgumentException("Ponto não encontrado: " + pointId);
        }

        FirestorePoint point = pointOpt.get();
        point.setCoordinates(Map.of("x", x, "y", y));
        point.setUpdatedAt(LocalDateTime.now());

        pointRepository.save(point);
        log.debug("Coordenadas do ponto atualizadas com sucesso");
    }

    /**
     * Increments the favorite count for a point when a user favorites it.
     *
     * @param pointId The Firestore document ID of the point
     */
    public void incrementFavoriteCount(String pointId) {
        log.debug("Incrementando contador de favoritos do ponto: {}", pointId);
        pointRepository.incrementFavoriteCount(pointId);
    }

    /**
     * Decrements the favorite count for a point when a user unfavorites it.
     *
     * @param pointId The Firestore document ID of the point
     */
    public void decrementFavoriteCount(String pointId) {
        log.debug("Decrementando contador de favoritos do ponto: {}", pointId);
        pointRepository.decrementFavoriteCount(pointId);
    }

    /**
     * Checks if a point with the specified code already exists.
     *
     * @param code The point code to check
     * @return true if a point with this code exists, false otherwise
     */
    public boolean existsByCode(String code) {
        return pointRepository.existsByCode(code);
    }

    /**
     * Returns the total count of acupuncture points in the database.
     *
     * @return The total number of points
     */
    public long count() {
        return pointRepository.count();
    }

    /**
     * Retrieves the most favorited acupuncture points.
     *
     * @param limit Maximum number of points to return
     * @return List of popular points sorted by favorite count (descending)
     */
    public List<FirestorePoint> findPopularPoints(int limit) {
        List<FirestorePoint> allPoints = pointRepository.findAll();
        
        return allPoints.stream()
                .sorted((p1, p2) -> {
                    Integer count1 = p1.getFavoriteCount() != null ? p1.getFavoriteCount() : 0;
                    Integer count2 = p2.getFavoriteCount() != null ? p2.getFavoriteCount() : 0;
                    return count2.compareTo(count1); // Ordem decrescente
                })
                .limit(limit)
                .toList();
    }

    /**
     * Retrieves multiple points by their Firestore document IDs.
     *
     * @param ids List of Firestore document IDs to retrieve
     * @return List of found points (may contain fewer items if some IDs not found)
     */
    public List<FirestorePoint> findAllByIds(List<String> ids) {
        log.debug("Buscando {} pontos por ID", ids.size());
        List<FirestorePoint> points = new ArrayList<>();
        for (String id : ids) {
            findById(id).ifPresent(points::add);
        }
        return points;
    }
}