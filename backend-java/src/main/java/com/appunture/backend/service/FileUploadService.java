package com.appunture.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${app.file-storage.local-path:./uploads}")
    private String uploadPath;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Faz upload de uma imagem
     */
    public String uploadImage(MultipartFile file) throws IOException {
        validateImageFile(file);
        
        // Cria o diretório se não existir
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Gera um nome único para o arquivo
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String fileName = UUID.randomUUID().toString() + extension;

        // Salva o arquivo
        Path filePath = uploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    /**
     * Remove um arquivo
     */
    public boolean deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(uploadPath).resolve(fileName);
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * Verifica se o arquivo existe
     */
    public boolean fileExists(String fileName) {
        Path filePath = Paths.get(uploadPath).resolve(fileName);
        return Files.exists(filePath);
    }

    /**
     * Obtém o caminho completo do arquivo
     */
    public Path getFilePath(String fileName) {
        return Paths.get(uploadPath).resolve(fileName);
    }

    /**
     * Valida se o arquivo é uma imagem válida
     */
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size cannot exceed 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Only image files are allowed (JPEG, PNG, GIF, WebP)");
        }
    }

    /**
     * Obtém a extensão do arquivo
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    /**
     * Lista todos os arquivos no diretório de upload
     */
    public List<String> listFiles() throws IOException {
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            return List.of();
        }

        return Files.list(uploadDir)
                .filter(Files::isRegularFile)
                .map(Path::getFileName)
                .map(Path::toString)
                .toList();
    }
}
