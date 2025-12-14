package com.appunture.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class FirebaseStorageServiceTest {

    private FirebaseStorageService service;

    @BeforeEach
    void setUp() {
        service = new FirebaseStorageService();
        ReflectionTestUtils.setField(service, "bucketName", "appunture-test");
    }

    @Test
    void isAvailableReturnsFalseWhenDisabled() {
        ReflectionTestUtils.setField(service, "firebaseEnabled", false);

        assertThat(service.isAvailable()).isFalse();
    }

    @Test
    void isAvailableReturnsTrueWhenEnabledAndBucketConfigured() {
        ReflectionTestUtils.setField(service, "firebaseEnabled", true);

        assertThat(service.isAvailable()).isTrue();
    }
}