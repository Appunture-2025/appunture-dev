package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestorePoint;
import com.appunture.backend.repository.firestore.FirestorePointRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service para operações com pontos de acupuntura usando Firestore
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FirestorePointService {

    private final FirestorePointRepository pointRepository;

    /**
     * Busca um ponto por ID
     */
    public Optional<FirestorePoint> findById(String id) {
        log.debug("Buscando ponto por ID: {}", id);
        return pointRepository.findById(id);
    }

    /**
     * Busca um ponto por código
     */
    public Optional<FirestorePoint> findByCode(String code) {
        log.debug("Buscando ponto por código: {}", code);
        return pointRepository.findByCode(code);
    }

    /**
     * Lista todos os pontos
     */
    public List<FirestorePoint> findAll() {
        log.debug("Listando todos os pontos");
        return pointRepository.findAll();
    }

    /**
     * Busca pontos por meridiano
     */
    public List<FirestorePoint> findByMeridian(String meridian) {
        log.debug("Buscando pontos por meridiano: {}", meridian);
        return pointRepository.findByMeridian(meridian);
    }

    /**
     * Busca pontos por sintoma
     */
    public List<FirestorePoint> findBySymptomId(String symptomId) {
        log.debug("Buscando pontos por sintoma: {}", symptomId);
        return pointRepository.findBySymptomId(symptomId);
    }

    /**
     * Busca pontos por nome (busca parcial)
     */
    public List<FirestorePoint> findByNameContaining(String name) {
        log.debug("Buscando pontos por nome: {}", name);
        return pointRepository.findByNameContaining(name);
    }

    /**
     * Cria um novo ponto
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
     * Atualiza um ponto existente
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
     * Deleta um ponto
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
     * Adiciona sintoma ao ponto
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
     * Remove sintoma do ponto
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
     * Adiciona imagem ao ponto
     */
    public void addImageToPoint(String pointId, String imageUrl) {
        log.debug("Adicionando imagem ao ponto: {}", pointId);
        
        Optional<FirestorePoint> pointOpt = pointRepository.findById(pointId);
        if (pointOpt.isEmpty()) {
            throw new IllegalArgumentException("Ponto não encontrado: " + pointId);
        }

        FirestorePoint point = pointOpt.get();
        if (point.getImageUrls() == null) {
            point.setImageUrls(List.of(imageUrl));
        } else if (!point.getImageUrls().contains(imageUrl)) {
            point.getImageUrls().add(imageUrl);
        }
        point.setUpdatedAt(LocalDateTime.now());

        pointRepository.save(point);
        log.debug("Imagem adicionada ao ponto com sucesso");
    }

    /**
     * Remove imagem do ponto
     */
    public void removeImageFromPoint(String pointId, String imageUrl) {
        log.debug("Removendo imagem do ponto: {}", pointId);
        
        Optional<FirestorePoint> pointOpt = pointRepository.findById(pointId);
        if (pointOpt.isEmpty()) {
            throw new IllegalArgumentException("Ponto não encontrado: " + pointId);
        }

        FirestorePoint point = pointOpt.get();
        if (point.getImageUrls() != null) {
            point.getImageUrls().remove(imageUrl);
            point.setUpdatedAt(LocalDateTime.now());
            pointRepository.save(point);
            log.debug("Imagem removida do ponto com sucesso");
        }
    }

    /**
     * Atualiza coordenadas do ponto
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
     * Incrementa contador de favoritos
     */
    public void incrementFavoriteCount(String pointId) {
        log.debug("Incrementando contador de favoritos do ponto: {}", pointId);
        pointRepository.incrementFavoriteCount(pointId);
    }

    /**
     * Decrementa contador de favoritos
     */
    public void decrementFavoriteCount(String pointId) {
        log.debug("Decrementando contador de favoritos do ponto: {}", pointId);
        pointRepository.decrementFavoriteCount(pointId);
    }

    /**
     * Verifica se existe ponto com código
     */
    public boolean existsByCode(String code) {
        return pointRepository.existsByCode(code);
    }

    /**
     * Conta total de pontos
     */
    public long count() {
        return pointRepository.count();
    }

    /**
     * Busca pontos populares (mais favoritados)
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
}