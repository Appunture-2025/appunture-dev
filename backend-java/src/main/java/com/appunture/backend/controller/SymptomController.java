package com.appunture.backend.controller;

import com.appunture.backend.dto.symptom.SymptomRequest;
import com.appunture.backend.dto.symptom.SymptomResponse;
import com.appunture.backend.service.SymptomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/symptoms")
@Tag(name = "Symptoms", description = "Symptoms operations")
public class SymptomController {

    private final SymptomService symptomService;

    public SymptomController(SymptomService symptomService) {
        this.symptomService = symptomService;
    }

    @GetMapping
    @Operation(summary = "List symptoms")
    public List<SymptomResponse> list() { return symptomService.list(); }

    @GetMapping("/{id}")
    @Operation(summary = "Get symptom by id")
    public SymptomResponse get(@PathVariable Long id) { return symptomService.get(id); }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Create symptom")
    public ResponseEntity<SymptomResponse> create(@Valid @RequestBody SymptomRequest s) { return ResponseEntity.status(HttpStatus.CREATED).body(symptomService.create(s)); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update symptom")
    public SymptomResponse update(@PathVariable Long id, @Valid @RequestBody SymptomRequest s) { return symptomService.update(id, s); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete symptom")
    public ResponseEntity<Void> delete(@PathVariable Long id) { symptomService.delete(id); return ResponseEntity.noContent().build(); }
}
