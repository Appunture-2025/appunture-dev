package com.appunture.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileUploadServiceTest {

    private FileUploadService service;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        service = new FileUploadService();
        ReflectionTestUtils.setField(service, "uploadPath", tempDir.toString());
    }

    // =====================
    // Happy Path Tests
    // =====================

    @Test
    void shouldUploadJpegImageSuccessfully() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-image.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3, 4, 5}
        );

        String result = service.uploadImage(file);

        assertThat(result).isNotNull();
        assertThat(result).endsWith(".jpg");
        assertThat(service.fileExists(result)).isTrue();
    }

    @Test
    void shouldUploadPngImageSuccessfully() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-image.png",
                "image/png",
                new byte[]{1, 2, 3, 4, 5}
        );

        String result = service.uploadImage(file);

        assertThat(result).isNotNull();
        assertThat(result).endsWith(".png");
        assertThat(service.fileExists(result)).isTrue();
    }

    @Test
    void shouldUploadGifImageSuccessfully() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "animated.gif",
                "image/gif",
                new byte[]{1, 2, 3, 4, 5}
        );

        String result = service.uploadImage(file);

        assertThat(result).isNotNull();
        assertThat(result).endsWith(".gif");
    }

    @Test
    void shouldUploadWebpImageSuccessfully() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "modern.webp",
                "image/webp",
                new byte[]{1, 2, 3, 4, 5}
        );

        String result = service.uploadImage(file);

        assertThat(result).isNotNull();
        assertThat(result).endsWith(".webp");
    }

    @Test
    void shouldGenerateUniqueFileNames() throws IOException {
        MockMultipartFile file1 = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );
        MockMultipartFile file2 = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[]{4, 5, 6}
        );

        String result1 = service.uploadImage(file1);
        String result2 = service.uploadImage(file2);

        assertThat(result1).isNotEqualTo(result2);
    }

    @Test
    void shouldCreateUploadDirectoryIfNotExists() throws IOException {
        Path nestedPath = tempDir.resolve("nested").resolve("uploads");
        ReflectionTestUtils.setField(service, "uploadPath", nestedPath.toString());

        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );

        String result = service.uploadImage(file);

        assertThat(result).isNotNull();
        assertThat(Files.exists(nestedPath)).isTrue();
    }

    // =====================
    // Error Handling Tests
    // =====================

    @Test
    void shouldThrowExceptionForNullFile() {
        assertThatThrownBy(() -> service.uploadImage(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File cannot be empty");
    }

    @Test
    void shouldThrowExceptionForEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.jpg", "image/jpeg", new byte[]{}
        );

        assertThatThrownBy(() -> service.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File cannot be empty");
    }

    @Test
    void shouldThrowExceptionForFileTooLarge() {
        // Criar arquivo com mais de 5MB
        byte[] largeContent = new byte[6 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file", "large.jpg", "image/jpeg", largeContent
        );

        assertThatThrownBy(() -> service.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File size cannot exceed 5MB");
    }

    @Test
    void shouldThrowExceptionForInvalidContentType() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "script.js", "text/javascript", "alert('xss');".getBytes()
        );

        assertThatThrownBy(() -> service.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only image files are allowed (JPEG, PNG, GIF, WebP)");
    }

    @Test
    void shouldThrowExceptionForNullContentType() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "unknown.bin", null, new byte[]{1, 2, 3}
        );

        assertThatThrownBy(() -> service.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only image files are allowed (JPEG, PNG, GIF, WebP)");
    }

    @Test
    void shouldThrowExceptionForPdfFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "document.pdf", "application/pdf", new byte[]{1, 2, 3}
        );

        assertThatThrownBy(() -> service.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Only image files are allowed");
    }

    @Test
    void shouldThrowExceptionForInvalidExtension() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "image.exe", "image/jpeg", new byte[]{1, 2, 3}
        );

        assertThatThrownBy(() -> service.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid file extension");
    }

    @Test
    void shouldThrowExceptionForPathTraversalInExtension() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "image..jpg", "image/jpeg", new byte[]{1, 2, 3}
        );

        assertThatThrownBy(() -> service.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid file extension");
    }

    // =====================
    // Delete File Tests
    // =====================

    @Test
    void shouldDeleteFileSuccessfully() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "to-delete.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );
        String fileName = service.uploadImage(file);

        boolean deleted = service.deleteFile(fileName);

        assertThat(deleted).isTrue();
        assertThat(service.fileExists(fileName)).isFalse();
    }

    @Test
    void shouldReturnFalseWhenDeletingNonExistentFile() {
        boolean deleted = service.deleteFile("non-existent-file.jpg");

        assertThat(deleted).isFalse();
    }

    // =====================
    // File Exists Tests
    // =====================

    @Test
    void shouldReturnTrueForExistingFile() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "exists.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );
        String fileName = service.uploadImage(file);

        assertThat(service.fileExists(fileName)).isTrue();
    }

    @Test
    void shouldReturnFalseForNonExistingFile() {
        assertThat(service.fileExists("non-existent.jpg")).isFalse();
    }

    // =====================
    // Get File Path Tests
    // =====================

    @Test
    void shouldReturnCorrectFilePath() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );
        String fileName = service.uploadImage(file);

        Path filePath = service.getFilePath(fileName);

        assertThat(filePath).isNotNull();
        assertThat(filePath.toString()).contains(fileName);
        assertThat(Files.exists(filePath)).isTrue();
    }

    // =====================
    // List Files Tests
    // =====================

    @Test
    void shouldListAllUploadedFiles() throws IOException {
        MockMultipartFile file1 = new MockMultipartFile(
                "file", "file1.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );
        MockMultipartFile file2 = new MockMultipartFile(
                "file", "file2.png", "image/png", new byte[]{4, 5, 6}
        );

        String fileName1 = service.uploadImage(file1);
        String fileName2 = service.uploadImage(file2);

        List<String> files = service.listFiles();

        assertThat(files).hasSize(2);
        assertThat(files).contains(fileName1, fileName2);
    }

    @Test
    void shouldReturnEmptyListWhenNoFiles() throws IOException {
        List<String> files = service.listFiles();

        assertThat(files).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenDirectoryDoesNotExist() throws IOException {
        ReflectionTestUtils.setField(service, "uploadPath", "/non/existent/path");

        List<String> files = service.listFiles();

        assertThat(files).isEmpty();
    }

    // =====================
    // Edge Cases
    // =====================

    @Test
    void shouldHandleUppercaseContentType() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "IMAGE/JPEG", new byte[]{1, 2, 3}
        );

        String result = service.uploadImage(file);

        assertThat(result).isNotNull();
        assertThat(result).endsWith(".jpg");
    }

    @Test
    void shouldHandleFilenameWithMultipleDots() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "my.image.file.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );

        String result = service.uploadImage(file);

        assertThat(result).isNotNull();
        assertThat(result).endsWith(".jpg");
    }

    @Test
    void shouldHandleFilenameWithoutExtension() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "noextension", "image/jpeg", new byte[]{1, 2, 3}
        );

        assertThatThrownBy(() -> service.uploadImage(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid file extension");
    }
}
