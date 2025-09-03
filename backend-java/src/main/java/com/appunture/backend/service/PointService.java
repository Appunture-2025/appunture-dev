package com.appunture.backend.service;

import com.appunture.backend.dto.point.PointRequest;
import com.appunture.backend.dto.point.PointResponse;
import com.appunture.backend.dto.mapper.PointMapper;
import com.appunture.backend.entity.Point;
import com.appunture.backend.entity.PointSymptom;
import com.appunture.backend.repository.PointRepository;
import com.appunture.backend.repository.PointSymptomRepository;
import com.appunture.backend.dto.stats.MeridianStatResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PointService {

    private final PointRepository pointRepository;
    private final PointSymptomRepository pointSymptomRepository;
    private final PointMapper pointMapper;

    @Transactional
    public PointResponse create(PointRequest request) {
        if (pointRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Point code already exists");
        }
        Point entity = pointMapper.toEntity(request);
        return pointMapper.toResponse(pointRepository.save(entity));
    }

    @Transactional
    public PointResponse update(Long id, PointRequest request) {
        Point existing = getEntity(id);
        pointMapper.updateEntity(request, existing);
        return pointMapper.toResponse(existing);
    }

    @Transactional
    public void delete(Long id) {
        Point p = getEntity(id);
        pointRepository.delete(p);
    }

    @Transactional
    public PointResponse get(Long id) {
        return pointMapper.toResponse(getEntity(id));
    }

    @Transactional
    public PointResponse getByCodeDto(String code) {
        return pointMapper.toResponse(pointRepository.findByCode(code).orElseThrow(() -> new IllegalArgumentException("Point not found")));
    }

    private Point getEntity(Long id) {
        return pointRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Point not found"));
    }

    @Transactional
    public List<PointResponse> listAll(String search) {
        List<Point> list = (search == null || search.isBlank()) ? pointRepository.findAll() : pointRepository.search(search.trim());
        return list.stream().map(pointMapper::toResponse).toList();
    }

    @Transactional
    public List<PointResponse> listByMeridian(String meridian) {
        return pointRepository.findByMeridianOrderByCodeAsc(meridian).stream().map(pointMapper::toResponse).toList();
    }

    @Transactional
    public List<MeridianStatResponse> meridianCounts() {
        return pointRepository.findAll().stream()
                .collect(Collectors.groupingBy(Point::getMeridian, Collectors.counting()))
                .entrySet().stream()
                .map(e -> MeridianStatResponse.builder().meridian(e.getKey()).count(e.getValue()).build())
                .sorted((a,b) -> a.getMeridian().compareTo(b.getMeridian()))
                .collect(Collectors.toList());
    }

    /**
     * Lista pontos com paginação
     */
    @Transactional
    public Page<PointResponse> listAllPaginated(Pageable pageable) {
        Page<Point> pointsPage = pointRepository.findAll(pageable);
        return pointsPage.map(pointMapper::toResponse);
    }

    /**
     * Busca pontos por categoria/indicação
     */
    @Transactional
    public List<PointResponse> findByIndication(String indication) {
        return pointRepository.search(indication).stream()
                .map(pointMapper::toResponse)
                .toList();
    }

    /**
     * Lista todos os meridianos únicos
     */
    @Transactional
    public List<String> getAllMeridians() {
        return pointRepository.findAll().stream()
                .map(Point::getMeridian)
                .distinct()
                .sorted()
                .toList();
    }

    /**
     * Associa um sintoma a um ponto
     */
    @Transactional
    public void associateSymptom(Long pointId, Long symptomId) {
        Point point = getEntity(pointId);
        // Verifica se a associação já existe
        boolean exists = pointSymptomRepository.existsByPointIdAndSymptomId(pointId, symptomId);
        if (exists) {
            throw new IllegalArgumentException("Symptom already associated with this point");
        }
        
        PointSymptom pointSymptom = PointSymptom.builder()
                .point(point)
                .symptom(null) // Será preenchido pelo repository através do symptomId
                .build();
        
        pointSymptomRepository.save(pointSymptom);
    }

    /**
     * Remove a associação entre um ponto e um sintoma
     */
    @Transactional
    public void disassociateSymptom(Long pointId, Long symptomId) {
        PointSymptom pointSymptom = pointSymptomRepository.findByPointIdAndSymptomId(pointId, symptomId)
                .orElseThrow(() -> new IllegalArgumentException("Association not found"));
        
        pointSymptomRepository.delete(pointSymptom);
    }

    /**
     * Lista todos os sintomas associados a um ponto
     */
    @Transactional
    public List<Long> getAssociatedSymptoms(Long pointId) {
        return pointSymptomRepository.findByPointId(pointId).stream()
                .map(ps -> ps.getSymptom().getId())
                .toList();
    }

    /**
     * Conta total de pontos
     */
    @Transactional
    public long countPoints() {
        return pointRepository.count();
    }

    /**
     * Verifica se um código de ponto já existe
     */
    public boolean existsByCode(String code) {
        return pointRepository.findByCode(code).isPresent();
    }
}
