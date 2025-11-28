package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.model.firestore.FirestoreSymptom;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for loading and importing seed data from NDJSON files.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SeedDataService {

    private final FirestorePointService pointService;
    private final FirestoreSymptomService symptomService;

    private final ObjectMapper objectMapper = createObjectMapper();

    private static ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    /**
     * Load and import all seed data from resources/seed/*.ndjson files.
     *
     * @return Map with counts of imported records
     */
    public Map<String, Object> importAllSeedData() {
        Map<String, Object> result = new HashMap<>();

        try {
            // Import points
            int pointsImported = importPointsSeed();
            result.put("pointsImported", pointsImported);

            // Import symptoms
            int symptomsImported = importSymptomsSeed();
            result.put("symptomsImported", symptomsImported);

            result.put("success", true);
            result.put("message", "Seed data imported successfully");

        } catch (Exception e) {
            log.error("Error importing seed data: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }

    /**
     * Import points from points_seed.ndjson
     */
    public int importPointsSeed() throws Exception {
        ClassPathResource resource = new ClassPathResource("seed/points_seed.ndjson");

        if (!resource.exists()) {
            log.warn("Points seed file not found: seed/points_seed.ndjson");
            return 0;
        }

        int count = 0;
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;

                try {
                    Map<String, Object> pointData = objectMapper.readValue(
                            line, new TypeReference<Map<String, Object>>() {});

                    FirestorePoint point = mapToFirestorePoint(pointData);

                    // Check if point already exists by code
                    Optional<FirestorePoint> existing = pointService.findByCode(point.getCode());
                    if (existing.isEmpty()) {
                        pointService.save(point);
                        count++;
                    }
                } catch (Exception e) {
                    log.warn("Error parsing point line: {}", e.getMessage());
                }
            }
        }

        log.info("Imported {} points from seed file", count);
        return count;
    }

    /**
     * Import symptoms from symptoms_seed.ndjson
     */
    public int importSymptomsSeed() throws Exception {
        ClassPathResource resource = new ClassPathResource("seed/symptoms_seed.ndjson");

        if (!resource.exists()) {
            log.warn("Symptoms seed file not found: seed/symptoms_seed.ndjson");
            return 0;
        }

        int count = 0;
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;

                try {
                    Map<String, Object> symptomData = objectMapper.readValue(
                            line, new TypeReference<Map<String, Object>>() {});

                    FirestoreSymptom symptom = mapToFirestoreSymptom(symptomData);

                    // Check if symptom already exists by ID
                    Optional<FirestoreSymptom> existing = symptomService.findById(symptom.getId());
                    if (existing.isEmpty()) {
                        symptomService.save(symptom);
                        count++;
                    }
                } catch (Exception e) {
                    log.warn("Error parsing symptom line: {}", e.getMessage());
                }
            }
        }

        log.info("Imported {} symptoms from seed file", count);
        return count;
    }

    @SuppressWarnings("unchecked")
    private FirestorePoint mapToFirestorePoint(Map<String, Object> data) {
        FirestorePoint point = new FirestorePoint();

        point.setId((String) data.get("id"));
        point.setCode((String) data.get("code"));
        point.setName((String) data.get("name"));
        point.setDescription((String) data.get("description"));
        point.setMeridian((String) data.get("meridian"));
        point.setLocation((String) data.get("location"));
        point.setIndication((String) data.get("indication"));
        point.setCategory((String) data.get("category"));

        // Coordinates
        Object coordsObj = data.get("coordinates");
        if (coordsObj instanceof Map) {
            Map<String, Object> coords = (Map<String, Object>) coordsObj;
            Map<String, Double> coordinatesMap = new HashMap<>();
            if (coords.get("x") != null) {
                coordinatesMap.put("x", toDouble(coords.get("x")));
            }
            if (coords.get("y") != null) {
                coordinatesMap.put("y", toDouble(coords.get("y")));
            }
            if (!coordinatesMap.isEmpty()) {
                point.setCoordinates(coordinatesMap);
            }
        }

        // Lists
        point.setImageUrls(toStringList(data.get("imageUrls")));
        point.setSymptomIds(toStringList(data.get("symptomIds")));
        point.setTags(toStringList(data.get("tags")));

        // Timestamps
        point.setCreatedAt(parseDateTime(data.get("createdAt")));
        point.setUpdatedAt(parseDateTime(data.get("updatedAt")));
        point.setCreatedBy((String) data.get("createdBy"));

        // Counts
        point.setFavoriteCount(toInteger(data.get("favoriteCount")));
        point.setViewCount(toInteger(data.get("viewCount")));

        return point;
    }

    @SuppressWarnings("unchecked")
    private FirestoreSymptom mapToFirestoreSymptom(Map<String, Object> data) {
        FirestoreSymptom symptom = new FirestoreSymptom();

        symptom.setId((String) data.get("id"));
        symptom.setName((String) data.get("name"));
        symptom.setDescription((String) data.get("description"));
        symptom.setCategory((String) data.get("category"));
        symptom.setTags(toStringList(data.get("tags")));
        symptom.setPointIds(toStringList(data.get("pointIds")));

        symptom.setCreatedAt(parseDateTime(data.get("createdAt")));
        symptom.setUpdatedAt(parseDateTime(data.get("updatedAt")));
        symptom.setCreatedBy((String) data.get("createdBy"));

        symptom.setUseCount(toInteger(data.get("useCount")));
        symptom.setAssociatedPointsCount(toInteger(data.get("associatedPointsCount")));
        symptom.setSeverity(toInteger(data.get("severity")));
        symptom.setPriority(toInteger(data.get("priority")));

        return symptom;
    }

    @SuppressWarnings("unchecked")
    private List<String> toStringList(Object obj) {
        if (obj == null) return new ArrayList<>();
        if (obj instanceof List) {
            return ((List<?>) obj).stream()
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }

    private Double toDouble(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Number) return ((Number) obj).doubleValue();
        try {
            return Double.parseDouble(obj.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer toInteger(Object obj) {
        if (obj == null) return 0;
        if (obj instanceof Number) return ((Number) obj).intValue();
        try {
            return Integer.parseInt(obj.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private LocalDateTime parseDateTime(Object obj) {
        if (obj == null) return LocalDateTime.now();
        String str = obj.toString();
        try {
            // Handle ISO format with Z suffix
            if (str.endsWith("Z")) {
                str = str.substring(0, str.length() - 1);
            }
            // Try ISO format
            return LocalDateTime.parse(str, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            try {
                // Try with timezone offset
                return LocalDateTime.parse(str.substring(0, 19), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (Exception e2) {
                return LocalDateTime.now();
            }
        }
    }
}
