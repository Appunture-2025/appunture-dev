package com.appunture.backend.service;

import com.appunture.backend.dto.mapper.PointMapper;
import com.appunture.backend.dto.point.PointRequest;
import com.appunture.backend.dto.point.PointResponse;
import com.appunture.backend.entity.Point;
import com.appunture.backend.repository.PointRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PointServiceTest {

    @Mock
    private PointRepository pointRepository;

    private PointMapper pointMapper = Mappers.getMapper(PointMapper.class);

    @InjectMocks
    private PointService pointService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        pointService = new PointService(pointRepository, pointMapper);
    }

    @Test
    void create_ok() {
        PointRequest req = new PointRequest();
        req.setCode("P1");
        req.setName("Lung 1");
        req.setMeridian("LU");
        req.setLocation("Location");
        when(pointRepository.findByCode("P1")).thenReturn(Optional.empty());
        when(pointRepository.save(any(Point.class))).thenAnswer(inv -> {
            Point p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });
        PointResponse res = pointService.create(req);
        assertNotNull(res.getId());
        assertEquals("P1", res.getCode());
    }

    @Test
    void create_duplicateCode_throws() {
        PointRequest req = new PointRequest();
        req.setCode("P1");
        req.setName("Test");
        req.setMeridian("LU");
        req.setLocation("Loc");
        when(pointRepository.findByCode("P1")).thenReturn(Optional.of(new Point()));
        assertThrows(IllegalArgumentException.class, () -> pointService.create(req));
    }

    @Test
    void listAll_search() {
        Point p = new Point();
        p.setId(5L); p.setCode("P5"); p.setName("Name"); p.setMeridian("LU"); p.setLocation("Loc");
        when(pointRepository.search("lu")).thenReturn(List.of(p));
        List<PointResponse> list = pointService.listAll("lu");
        assertEquals(1, list.size());
        assertEquals("P5", list.get(0).getCode());
    }
}
