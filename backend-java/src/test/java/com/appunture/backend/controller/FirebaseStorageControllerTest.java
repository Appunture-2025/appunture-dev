package com.appunture.backend.controller;

import com.appunture.backend.service.FirebaseStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class FirebaseStorageControllerTest {

    @Test
    void shouldReturnStorageStatusUnavailable() {
        FirebaseStorageService storageService = new FirebaseStorageService();
        
        boolean available = storageService.isAvailable();
        
        assertThat(available).isFalse();
    }
}