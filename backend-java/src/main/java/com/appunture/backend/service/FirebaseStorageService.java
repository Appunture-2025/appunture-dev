package com.appunture.backend.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirebaseStorageService {

    @Value("${firebase.storage.bucket:appunture-tcc.appspot.com}")
    private String bucketName;

    @Value("${app.firebase.enabled:true}")
    private boolean firebaseEnabled;

    // Lista de tipos de arquivo permitidos para o TCC
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
        "application/pdf", "text/plain", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    // Tamanho máximo: 10MB para o plano gratuito
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * Faz upload de um arquivo para o Firebase Storage
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (!firebaseEnabled) {
            log.warn("Firebase Storage desabilitado - usando fallback local");
            return "/uploads/" + file.getOriginalFilename();
        }

        validateFile(file);

        try {
            String fileName = generateFileName(file, folder);
            
            Bucket bucket = StorageClient.getInstance().bucket(bucketName);
            Blob blob = bucket.create(fileName, file.getBytes(), file.getContentType());
            
            // Tornar o arquivo público para leitura
            blob.createAcl(com.google.cloud.storage.Acl.of(
                com.google.cloud.storage.Acl.User.ofAllUsers(), 
                com.google.cloud.storage.Acl.Role.READER
            ));
            
            // URL pública do Firebase Storage
            String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
            String publicUrl = String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media", 
                                            bucketName, encodedFileName);
            
            log.info("Arquivo enviado com sucesso para Firebase Storage: {}", fileName);
            return publicUrl;
                                
        } catch (Exception e) {
            log.error("Erro ao fazer upload para Firebase Storage: {}", e.getMessage());
            throw new IOException("Falha no upload: " + e.getMessage());
        }
    }

    /**
     * Gera uma URL assinada para acesso temporário ao arquivo
     */
    public String getSignedUrl(String fileName, int durationMinutes) throws IOException {
        if (!firebaseEnabled) {
            return "/uploads/" + fileName;
        }

        try {
            Bucket bucket = StorageClient.getInstance().bucket(bucketName);
            Blob blob = bucket.get(fileName);
            
            if (blob == null || !blob.exists()) {
                throw new IOException("Arquivo não encontrado: " + fileName);
            }

            // URL assinada válida por X minutos
            return blob.signUrl(durationMinutes, TimeUnit.MINUTES).toString();
            
        } catch (Exception e) {
            log.error("Erro ao gerar URL assinada: {}", e.getMessage());
            throw new IOException("Falha ao gerar URL: " + e.getMessage());
        }
    }

    /**
     * Deleta um arquivo do Firebase Storage
     */
    public void deleteFile(String fileName) throws IOException {
        if (!firebaseEnabled) {
            log.warn("Firebase Storage desabilitado - não é possível deletar");
            return;
        }

        try {
            Bucket bucket = StorageClient.getInstance().bucket(bucketName);
            Blob blob = bucket.get(fileName);
            
            if (blob != null && blob.exists()) {
                blob.delete();
                log.info("Arquivo deletado do Firebase Storage: {}", fileName);
            } else {
                log.warn("Arquivo não encontrado para deleção: {}", fileName);
            }
            
        } catch (Exception e) {
            log.error("Erro ao deletar arquivo: {}", e.getMessage());
            throw new IOException("Falha ao deletar: " + e.getMessage());
        }
    }

    /**
     * Verifica se um arquivo existe
     */
    public boolean fileExists(String fileName) {
        if (!firebaseEnabled) {
            return false;
        }

        try {
            Bucket bucket = StorageClient.getInstance().bucket(bucketName);
            Blob blob = bucket.get(fileName);
            return blob != null && blob.exists();
            
        } catch (Exception e) {
            log.error("Erro ao verificar existência do arquivo: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Obtém o tamanho de um arquivo
     */
    public long getFileSize(String fileName) throws IOException {
        if (!firebaseEnabled) {
            return 0;
        }

        try {
            Bucket bucket = StorageClient.getInstance().bucket(bucketName);
            Blob blob = bucket.get(fileName);
            
            if (blob == null) {
                throw new IOException("Arquivo não encontrado: " + fileName);
            }
            
            return blob.getSize();
            
        } catch (Exception e) {
            log.error("Erro ao obter tamanho do arquivo: {}", e.getMessage());
            throw new IOException("Falha ao obter tamanho: " + e.getMessage());
        }
    }

    /**
     * Lista arquivos em uma pasta
     */
    public List<String> listFiles(String prefix) {
        if (!firebaseEnabled) {
            return List.of();
        }

        try {
            Bucket bucket = StorageClient.getInstance().bucket(bucketName);
            
            return bucket.list(com.google.cloud.storage.Storage.BlobListOption.prefix(prefix))
                    .streamAll()
                    .map(blob -> blob.getName())
                    .toList();
                    
        } catch (Exception e) {
            log.error("Erro ao listar arquivos: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Obtém informações detalhadas de um arquivo
     */
    public FileInfo getFileInfo(String fileName) throws IOException {
        if (!firebaseEnabled) {
            throw new IOException("Firebase Storage not enabled");
        }

        try {
            Bucket bucket = StorageClient.getInstance().bucket(bucketName);
            Blob blob = bucket.get(fileName);
            
            if (blob == null) {
                throw new IOException("Arquivo não encontrado: " + fileName);
            }
            
            return FileInfo.builder()
                .name(blob.getName())
                .size(blob.getSize())
                .contentType(blob.getContentType())
                .createTime(blob.getCreateTime())
                .updateTime(blob.getUpdateTime())
                .build();
            
        } catch (Exception e) {
            log.error("Erro ao obter informações do arquivo: {}", e.getMessage());
            throw new IOException("Falha ao obter informações: " + e.getMessage());
        }
    }

    /**
     * Valida o arquivo antes do upload
     */
    private void validateFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Arquivo não pode estar vazio");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IOException("Arquivo muito grande. Tamanho máximo: 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IOException("Tipo de arquivo não permitido: " + contentType + 
                                ". Tipos permitidos: " + String.join(", ", ALLOWED_CONTENT_TYPES));
        }
    }

    /**
     * Gera um nome único para o arquivo
     */
    private String generateFileName(MultipartFile file, String folder) {
        String originalName = file.getOriginalFilename();
        String extension = "";
        
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        
        String uniqueName = UUID.randomUUID().toString() + extension;
        
        if (folder != null && !folder.isEmpty()) {
            return folder + "/" + uniqueName;
        }
        
        return uniqueName;
    }

    /**
     * Verifica se o Firebase Storage está disponível
     */
    public boolean isAvailable() {
        return firebaseEnabled && bucketName != null && !bucketName.isEmpty();
    }

    /**
     * Classe para informações de arquivo
     */
    @lombok.Builder
    @lombok.Data
    public static class FileInfo {
        private String name;
        private Long size;
        private String contentType;
        private Long createTime;
        private Long updateTime;
    }
}