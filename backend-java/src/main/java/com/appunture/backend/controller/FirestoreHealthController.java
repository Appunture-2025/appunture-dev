package com.appunture.backend.controller;

import com.appunture.backend.service.FirestorePointService;
import com.appunture.backend.service.FirestoreSymptomService;
import com.appunture.backend.service.FirestoreUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/health")
@Tag(name = "Health", description = "System health checks (Firestore)")
@RequiredArgsConstructor
@Slf4j
public class FirestoreHealthController {

    private final FirestoreUserService userService;
    private final FirestorePointService pointService;
    private final FirestoreSymptomService symptomService;

    @GetMapping
    @Operation(summary = "Basic health check", description = "Returns basic system status")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            log.debug("Verificando saúde básica do sistema");
            
            Map<String, Object> health = Map.of(
                "status", "UP",
                "timestamp", LocalDateTime.now().toString(),
                "service", "appunture-backend-firestore",
                "version", "1.0.0"
            );
            
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            log.error("Erro na verificação de saúde: {}", e.getMessage(), e);
            
            Map<String, Object> health = Map.of(
                "status", "DOWN",
                "timestamp", LocalDateTime.now().toString(),
                "error", e.getMessage()
            );
            
            return ResponseEntity.status(503).body(health);
        }
    }

    @GetMapping("/detailed")
    @Operation(summary = "Detailed health check", description = "Returns detailed system status including database connectivity")
    public ResponseEntity<Map<String, Object>> detailedHealthCheck() {
        try {
            log.debug("Verificando saúde detalhada do sistema");
            
            boolean firestoreOk = true;
            String firestoreError = null;
            
            // Testar conectividade com Firestore
            try {
                userService.count();
                pointService.count();
                symptomService.count();
                log.debug("Firestore está respondendo corretamente");
            } catch (Exception e) {
                firestoreOk = false;
                firestoreError = e.getMessage();
                log.warn("Erro na conectividade com Firestore: {}", e.getMessage());
            }
            
            Map<String, Object> health = Map.of(
                "status", firestoreOk ? "UP" : "DOWN",
                "timestamp", LocalDateTime.now().toString(),
                "service", "appunture-backend-firestore",
                "version", "1.0.0",
                "components", Map.of(
                    "firestore", Map.of(
                        "status", firestoreOk ? "UP" : "DOWN",
                        "error", firestoreError != null ? firestoreError : "N/A"
                    ),
                    "application", Map.of(
                        "status", "UP",
                        "memory", getMemoryInfo()
                    )
                )
            );
            
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            log.error("Erro na verificação de saúde detalhada: {}", e.getMessage(), e);
            
            Map<String, Object> health = Map.of(
                "status", "DOWN",
                "timestamp", LocalDateTime.now().toString(),
                "error", e.getMessage()
            );
            
            return ResponseEntity.status(503).body(health);
        }
    }

    @GetMapping("/readiness")
    @Operation(summary = "Readiness check", description = "Checks if the application is ready to serve traffic")
    public ResponseEntity<Map<String, Object>> readinessCheck() {
        try {
            log.debug("Verificando readiness do sistema");
            
            // Verificar se os serviços estão prontos
            boolean ready = true;
            String error = null;
            
            try {
                // Tentar operações básicas para verificar se está pronto
                userService.count();
                pointService.count();
                symptomService.count();
                log.debug("Todos os serviços estão prontos");
            } catch (Exception e) {
                ready = false;
                error = e.getMessage();
                log.warn("Sistema não está pronto: {}", e.getMessage());
            }
            
            Map<String, Object> readiness = Map.of(
                "status", ready ? "READY" : "NOT_READY",
                "timestamp", LocalDateTime.now().toString(),
                "ready", ready,
                "error", error != null ? error : "N/A"
            );
            
            return ready ? ResponseEntity.ok(readiness) : ResponseEntity.status(503).body(readiness);
        } catch (Exception e) {
            log.error("Erro na verificação de readiness: {}", e.getMessage(), e);
            
            Map<String, Object> readiness = Map.of(
                "status", "NOT_READY",
                "timestamp", LocalDateTime.now().toString(),
                "ready", false,
                "error", e.getMessage()
            );
            
            return ResponseEntity.status(503).body(readiness);
        }
    }

    @GetMapping("/liveness")
    @Operation(summary = "Liveness check", description = "Checks if the application is alive")
    public ResponseEntity<Map<String, Object>> livenessCheck() {
        try {
            log.debug("Verificando liveness do sistema");
            
            Map<String, Object> liveness = Map.of(
                "status", "ALIVE",
                "timestamp", LocalDateTime.now().toString(),
                "alive", true,
                "uptime", getUptimeInfo()
            );
            
            return ResponseEntity.ok(liveness);
        } catch (Exception e) {
            log.error("Erro na verificação de liveness: {}", e.getMessage(), e);
            
            Map<String, Object> liveness = Map.of(
                "status", "DEAD",
                "timestamp", LocalDateTime.now().toString(),
                "alive", false,
                "error", e.getMessage()
            );
            
            return ResponseEntity.status(503).body(liveness);
        }
    }

    @GetMapping("/metrics")
    @Operation(summary = "Basic metrics", description = "Returns basic application metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        try {
            log.debug("Obtendo métricas básicas do sistema");
            
            long userCount = 0;
            long pointCount = 0;
            long symptomCount = 0;
            
            try {
                userCount = userService.count();
                pointCount = pointService.count();
                symptomCount = symptomService.count();
            } catch (Exception e) {
                log.warn("Erro ao obter contadores: {}", e.getMessage());
            }
            
            Map<String, Object> metrics = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "counts", Map.of(
                    "users", userCount,
                    "points", pointCount,
                    "symptoms", symptomCount
                ),
                "system", Map.of(
                    "memory", getMemoryInfo(),
                    "uptime", getUptimeInfo()
                )
            );
            
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            log.error("Erro ao obter métricas: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private Map<String, Object> getMemoryInfo() {
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        
        return Map.of(
            "max", maxMemory,
            "total", totalMemory,
            "used", usedMemory,
            "free", freeMemory,
            "usedPercentage", (double) usedMemory / totalMemory * 100
        );
    }

    private Map<String, Object> getUptimeInfo() {
        long uptimeMillis = System.currentTimeMillis() - 
            java.lang.management.ManagementFactory.getRuntimeMXBean().getStartTime();
        
        long uptimeSeconds = uptimeMillis / 1000;
        long uptimeMinutes = uptimeSeconds / 60;
        long uptimeHours = uptimeMinutes / 60;
        
        return Map.of(
            "milliseconds", uptimeMillis,
            "seconds", uptimeSeconds,
            "minutes", uptimeMinutes,
            "hours", uptimeHours,
            "formatted", String.format("%d hours, %d minutes, %d seconds", 
                uptimeHours, uptimeMinutes % 60, uptimeSeconds % 60)
        );
    }
}