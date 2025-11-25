package com.appunture.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FirebaseStorageServiceTest {

    private FirebaseStorageService service;

    @BeforeEach
    void setUp() {
        service = new FirebaseStorageService();
        ReflectionTestUtils.setField(service, "bucketName", "appunture-test");
    }

    @Test
    void uploadFileReturnsLocalPathWhenFirebaseDisabled() throws IOException {
        ReflectionTestUtils.setField(service, "firebaseEnabled", false);
        MockMultipartFile file = new MockMultipartFile("file", "photo.png", "image/png", new byte[]{1, 2, 3});

        String result = service.uploadFile(file, "profiles");

        assertThat(result).isEqualTo("/uploads/photo.png");
    }

    @Test
    void uploadFileThrowsWhenContentTypeNotAllowed() {
        ReflectionTestUtils.setField(service, "firebaseEnabled", true);
        MockMultipartFile file = new MockMultipartFile("file", "script.js", "text/javascript", "alert('x');".getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> service.uploadFile(file, "scripts"))
                .isInstanceOf(IOException.class)
                .hasMessageContaining("Tipo de arquivo não permitido");
    }

    @Test
    void getSignedUrlFallsBackWhenDisabled() throws IOException {
        ReflectionTestUtils.setField(service, "firebaseEnabled", false);

        String url = service.getSignedUrl("points/vg20.png", 10);

        assertThat(url).isEqualTo("/uploads/points/vg20.png");
    }

    @Test
    void listFilesReturnsEmptyWhenDisabled() {
        ReflectionTestUtils.setField(service, "firebaseEnabled", false);

        assertThat(service.listFiles("points"))
                .isEmpty();
    }

    @Test
    void fileExistsReturnsFalseWhenDisabled() {
        ReflectionTestUtils.setField(service, "firebaseEnabled", false);

        assertThat(service.fileExists("points/vg20.png")).isFalse();
    }

    @Test
    void getFileSizeReturnsZeroWhenDisabled() throws IOException {
        ReflectionTestUtils.setField(service, "firebaseEnabled", false);

        assertThat(service.getFileSize("points/vg20.png")).isZero();
    }

    @Test
    void isAvailableReturnsTrueOnlyWhenBucketConfigured() {
        ReflectionTestUtils.setField(service, "firebaseEnabled", true);

        assertThat(service.isAvailable()).isTrue();

        ReflectionTestUtils.setField(service, "bucketName", "");
        assertThat(service.isAvailable()).isFalse();
    }
}