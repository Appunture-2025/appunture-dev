package com.appunture.backend.controller;

import com.appunture.backend.service.FirebaseStorageService;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FirebaseStorageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FirebaseStorageService storageService;

    @MockBean
    private FirebaseAuth firebaseAuth;

    @MockBean
    private Firestore firestore;

    @BeforeEach
    void setUp() {
        // Configuração comum para os testes
    }

    // =====================
    // Upload Tests
    // =====================

    @Test
    @WithMockUser(roles = "USER")
    void shouldUploadFileSuccessfully() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.uploadFile(any(), eq("profiles")))
                .thenReturn("https://storage.googleapis.com/bucket/profiles/image.jpg");

        MockMultipartFile file = new MockMultipartFile(
                "file", "profile.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );

        mockMvc.perform(multipart("/storage/upload")
                        .file(file)
                        .param("folder", "profiles")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.fileUrl").exists())
                .andExpect(jsonPath("$.fileName").value("profile.jpg"))
                .andExpect(jsonPath("$.folder").value("profiles"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldUploadToDefaultFolderWhenNotSpecified() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.uploadFile(any(), eq("general")))
                .thenReturn("https://storage.googleapis.com/bucket/general/image.jpg");

        MockMultipartFile file = new MockMultipartFile(
                "file", "image.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );

        mockMvc.perform(multipart("/storage/upload")
                        .file(file)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.folder").value("general"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldReturnServiceUnavailableWhenStorageDisabled() throws Exception {
        when(storageService.isAvailable()).thenReturn(false);

        MockMultipartFile file = new MockMultipartFile(
                "file", "image.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );

        mockMvc.perform(multipart("/storage/upload")
                        .file(file)
                        .with(csrf()))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("Firebase Storage não está disponível"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldReturnBadRequestOnUploadError() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.uploadFile(any(), anyString()))
                .thenThrow(new IOException("Upload failed"));

        MockMultipartFile file = new MockMultipartFile(
                "file", "image.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );

        mockMvc.perform(multipart("/storage/upload")
                        .file(file)
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void shouldRequireAuthenticationForUpload() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "image.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );

        mockMvc.perform(multipart("/storage/upload")
                        .file(file)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    // =====================
    // Signed URL Tests
    // =====================

    @Test
    @WithMockUser(roles = "USER")
    void shouldGenerateSignedUrl() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.getSignedUrl("profiles/image.jpg", 60))
                .thenReturn("https://storage.googleapis.com/bucket/profiles/image.jpg?signature=xxx");

        mockMvc.perform(get("/storage/signed-url/profiles/image.jpg")
                        .param("durationMinutes", "60"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.signedUrl").exists())
                .andExpect(jsonPath("$.expiresIn").value("60 minutos"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldUseDefaultDurationForSignedUrl() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.getSignedUrl("image.jpg", 60))
                .thenReturn("https://storage.googleapis.com/bucket/image.jpg?signature=xxx");

        mockMvc.perform(get("/storage/signed-url/image.jpg"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldReturnServiceUnavailableForSignedUrlWhenStorageDisabled() throws Exception {
        when(storageService.isAvailable()).thenReturn(false);

        mockMvc.perform(get("/storage/signed-url/image.jpg"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldReturnBadRequestOnSignedUrlError() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.getSignedUrl(anyString(), anyInt()))
                .thenThrow(new IOException("File not found"));

        mockMvc.perform(get("/storage/signed-url/nonexistent.jpg"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    // =====================
    // Delete Tests
    // =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldDeleteFileSuccessfully() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);

        mockMvc.perform(delete("/storage/image.jpg")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Arquivo deletado com sucesso"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldDenyDeleteForNonAdminUser() throws Exception {
        mockMvc.perform(delete("/storage/image.jpg")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnServiceUnavailableForDeleteWhenStorageDisabled() throws Exception {
        when(storageService.isAvailable()).thenReturn(false);

        mockMvc.perform(delete("/storage/image.jpg")
                        .with(csrf()))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnBadRequestOnDeleteError() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        doThrow(new IOException("Delete failed")).when(storageService).deleteFile(anyString());

        mockMvc.perform(delete("/storage/image.jpg")
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    // =====================
    // List Files Tests
    // =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldListFilesSuccessfully() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.listFiles("profiles"))
                .thenReturn(List.of("profiles/image1.jpg", "profiles/image2.png"));

        mockMvc.perform(get("/storage/list")
                        .param("prefix", "profiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.files").isArray())
                .andExpect(jsonPath("$.count").value(2))
                .andExpect(jsonPath("$.prefix").value("profiles"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldListAllFilesWithEmptyPrefix() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.listFiles(""))
                .thenReturn(List.of("image1.jpg", "profiles/image2.png"));

        mockMvc.perform(get("/storage/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldDenyListForNonAdminUser() throws Exception {
        mockMvc.perform(get("/storage/list"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnServiceUnavailableForListWhenStorageDisabled() throws Exception {
        when(storageService.isAvailable()).thenReturn(false);

        mockMvc.perform(get("/storage/list"))
                .andExpect(status().isServiceUnavailable());
    }

    // =====================
    // File Info Tests
    // =====================

    @Test
    @WithMockUser(roles = "USER")
    void shouldGetFileInfoSuccessfully() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        FirebaseStorageService.FileInfo fileInfo = FirebaseStorageService.FileInfo.builder()
                .name("image.jpg")
                .size(1024L)
                .contentType("image/jpeg")
                .createTime(System.currentTimeMillis())
                .updateTime(System.currentTimeMillis())
                .build();
        when(storageService.getFileInfo("image.jpg")).thenReturn(fileInfo);

        mockMvc.perform(get("/storage/info/image.jpg"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.fileName").value("image.jpg"))
                .andExpect(jsonPath("$.size").value(1024))
                .andExpect(jsonPath("$.contentType").value("image/jpeg"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldReturnBadRequestOnFileInfoError() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.getFileInfo(anyString()))
                .thenThrow(new IOException("File not found"));

        mockMvc.perform(get("/storage/info/nonexistent.jpg"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    // =====================
    // File Exists Tests
    // =====================

    @Test
    @WithMockUser(roles = "USER")
    void shouldCheckFileExistsTrue() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.fileExists("image.jpg")).thenReturn(true);
        when(storageService.getFileSize("image.jpg")).thenReturn(1024L);

        mockMvc.perform(get("/storage/exists/image.jpg"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("image.jpg"))
                .andExpect(jsonPath("$.exists").value(true))
                .andExpect(jsonPath("$.size").value(1024));
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldCheckFileExistsFalse() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.fileExists("nonexistent.jpg")).thenReturn(false);

        mockMvc.perform(get("/storage/exists/nonexistent.jpg"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("nonexistent.jpg"))
                .andExpect(jsonPath("$.exists").value(false));
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldHandleFileSizeErrorGracefully() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.fileExists("image.jpg")).thenReturn(true);
        when(storageService.getFileSize("image.jpg"))
                .thenThrow(new IOException("Cannot get size"));

        // Deve retornar OK mesmo se não conseguir obter o tamanho
        mockMvc.perform(get("/storage/exists/image.jpg"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true));
    }

    // =====================
    // Status Tests
    // =====================

    @Test
    void shouldReturnStorageStatusAvailable() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);

        mockMvc.perform(get("/storage/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("Firebase Storage"))
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.enabled").value(true));
    }

    @Test
    void shouldReturnStorageStatusUnavailable() throws Exception {
        when(storageService.isAvailable()).thenReturn(false);

        mockMvc.perform(get("/storage/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false))
                .andExpect(jsonPath("$.enabled").value(false));
    }

    // =====================
    // Edge Cases
    // =====================

    @Test
    @WithMockUser(roles = "USER")
    void shouldHandleFileNameWithSpecialCharacters() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.fileExists("file-with-dash.jpg")).thenReturn(true);
        when(storageService.getFileSize("file-with-dash.jpg")).thenReturn(100L);

        mockMvc.perform(get("/storage/exists/file-with-dash.jpg"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldHandleNestedFilePaths() throws Exception {
        when(storageService.isAvailable()).thenReturn(true);
        when(storageService.getSignedUrl("profiles/users/image.jpg", 60))
                .thenReturn("https://storage.googleapis.com/bucket/profiles/users/image.jpg?sig=xxx");

        mockMvc.perform(get("/storage/signed-url/profiles/users/image.jpg")
                        .param("durationMinutes", "60"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
