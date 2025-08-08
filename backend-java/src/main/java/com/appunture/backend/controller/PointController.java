package com.appunture.backend.controller;

import com.appunture.backend.dto.common.ApiResponse;
import com.appunture.backend.dto.point.PointRequest;
import com.appunture.backend.dto.point.PointResponse;
import com.appunture.backend.dto.stats.MeridianStatResponse;
import com.appunture.backend.entity.Point;
import com.appunture.backend.service.PointService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/points")
@Tag(name = "Points", description = "Acupuncture points operations")
public class PointController {

    private final PointService pointService;

    public PointController(PointService pointService) {
        this.pointService = pointService;
    }

    @GetMapping
    @Operation(summary = "List points", description = "List all points or search by query param q")
    public List<PointResponse> list(@RequestParam(value = "q", required = false) String q) {
        return pointService.listAll(q);
    }

    @GetMapping("/meridian/{meridian}")
    @Operation(summary = "List points by meridian")
    public List<PointResponse> byMeridian(@PathVariable String meridian) {
        return pointService.listByMeridian(meridian);
    }

    @GetMapping("/stats/meridians")
    @Operation(summary = "Meridian counts", description = "Returns count of points per meridian")
    public ApiResponse<List<MeridianStatResponse>> meridianCounts() {
        return ApiResponse.<List<MeridianStatResponse>>builder()
                .success(true)
                .data(pointService.meridianCounts())
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get point by id")
    public PointResponse get(@PathVariable Long id) { return pointService.get(id); }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get point by code")
    public PointResponse getByCode(@PathVariable String code) { return pointService.getByCodeDto(code); }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Create point")
    public ResponseEntity<PointResponse> create(@Valid @RequestBody PointRequest p) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pointService.create(p));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update point")
    public PointResponse update(@PathVariable Long id, @Valid @RequestBody PointRequest p) { return pointService.update(id, p); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete point")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        pointService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
