package com.appunture.backend.controller;

import com.appunture.backend.service.FirebaseStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Firebase Storage", description = "Endpoints para gerenciamento de arquivos no Firebase Storage")
public class FirebaseStorageController {

    private final FirebaseStorageService firebaseStorageService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Upload de arquivo", description = "Faz upload de arquivo para o Firebase Storage")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @Parameter(description = "Arquivo para upload") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Pasta de destino") @RequestParam(value = "folder", defaultValue = "general") String folder) {
        
        try {
            if (!firebaseStorageService.isAvailable()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Firebase Storage não está disponível"));
            }

            String fileUrl = firebaseStorageService.uploadFile(file, folder);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Arquivo enviado com sucesso");
            response.put("fileUrl", fileUrl);
            response.put("fileName", file.getOriginalFilename());
            response.put("fileSize", file.getSize());
            response.put("contentType", file.getContentType());
            response.put("folder", folder);
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro no upload: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Falha no upload: " + e.getMessage()));
        }
    }

    @GetMapping("/signed-url/**")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Gerar URL assinada", description = "Gera URL assinada para acesso temporário ao arquivo")
    public ResponseEntity<Map<String, Object>> generateSignedUrl(
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(defaultValue = "60") int durationMinutes) {
        
        try {
            // Extract fileName from the path after /signed-url/
            String fileName = request.getRequestURI().substring(request.getRequestURI().indexOf("/signed-url/") + 12);
            
            if (!firebaseStorageService.isAvailable()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Firebase Storage não está disponível"));
            }

            String signedUrl = firebaseStorageService.getSignedUrl(fileName, durationMinutes);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "signedUrl", signedUrl,
                "expiresIn", durationMinutes + " minutos"
            ));

        } catch (Exception e) {
            log.error("Erro ao gerar URL assinada: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Falha ao gerar URL assinada: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{fileName:.+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deletar arquivo", description = "Remove arquivo do Firebase Storage")
    public ResponseEntity<Map<String, Object>> deleteFile(@PathVariable String fileName) {
        try {
            if (!firebaseStorageService.isAvailable()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Firebase Storage não está disponível"));
            }

            firebaseStorageService.deleteFile(fileName);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Arquivo deletado com sucesso"
            ));

        } catch (Exception e) {
            log.error("Erro ao deletar arquivo: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Falha ao deletar arquivo: " + e.getMessage()));
        }
    }

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar arquivos", description = "Lista arquivos em uma pasta específica")
    public ResponseEntity<Map<String, Object>> listFiles(@RequestParam(defaultValue = "") String prefix) {
        try {
            if (!firebaseStorageService.isAvailable()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Firebase Storage não está disponível"));
            }

            List<String> files = firebaseStorageService.listFiles(prefix);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "files", files,
                "count", files.size(),
                "prefix", prefix
            ));

        } catch (Exception e) {
            log.error("Erro ao listar arquivos: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Falha ao listar arquivos: " + e.getMessage()));
        }
    }

    @GetMapping("/info/{fileName:.+}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Informações do arquivo", description = "Obtém metadados de um arquivo")
    public ResponseEntity<Map<String, Object>> getFileInfo(@PathVariable String fileName) {
        try {
            if (!firebaseStorageService.isAvailable()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Firebase Storage não está disponível"));
            }

            FirebaseStorageService.FileInfo fileInfo = firebaseStorageService.getFileInfo(fileName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("fileName", fileInfo.getName());
            response.put("size", fileInfo.getSize());
            response.put("contentType", fileInfo.getContentType());
            response.put("createTime", fileInfo.getCreateTime());
            response.put("updateTime", fileInfo.getUpdateTime());
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao obter informações do arquivo: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Falha ao obter informações: " + e.getMessage()));
        }
    }

    @GetMapping("/exists/{fileName:.+}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Verificar se arquivo existe")
    public ResponseEntity<Map<String, Object>> fileExists(@PathVariable String fileName) {
        try {
            if (!firebaseStorageService.isAvailable()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Firebase Storage não está disponível"));
            }

            boolean exists = firebaseStorageService.fileExists(fileName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("exists", exists);
            
            if (exists) {
                try {
                    long size = firebaseStorageService.getFileSize(fileName);
                    response.put("size", size);
                } catch (Exception e) {
                    log.warn("Não foi possível obter tamanho do arquivo: {}", e.getMessage());
                }
            }
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao verificar existência do arquivo: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Falha ao verificar existência: " + e.getMessage()));
        }
    }

    @GetMapping("/status")
    @Operation(summary = "Status do Firebase Storage")
    public ResponseEntity<Map<String, Object>> getStorageStatus() {
        boolean available = firebaseStorageService.isAvailable();
        return ResponseEntity.ok(Map.of(
            "service", "Firebase Storage",
            "available", available,
            "enabled", available
        ));
    }
}