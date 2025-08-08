package com.appunture.backend.service;

import com.appunture.backend.dto.point.PointRequest;
import com.appunture.backend.dto.point.PointResponse;
import com.appunture.backend.dto.mapper.PointMapper;
import com.appunture.backend.entity.Point;
import com.appunture.backend.repository.PointRepository;
import com.appunture.backend.dto.stats.MeridianStatResponse;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PointService {

    private final PointRepository pointRepository;
    private final PointMapper pointMapper;

    public PointService(PointRepository pointRepository, PointMapper pointMapper) {
        this.pointRepository = pointRepository;
        this.pointMapper = pointMapper;
    }

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
}
