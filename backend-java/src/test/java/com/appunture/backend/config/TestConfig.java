package com.appunture.backend.config;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;

/**
 * Test configuration that provides mock beans for Firebase/Firestore dependencies.
 * This allows controller tests to run without actual Firebase credentials.
 * 
 * Note: Use @MockBean in individual test classes for better control.
 */
@TestConfiguration
public class TestConfig {

    // Use @MockBean at the test class level instead of defining beans here
    // This avoids bean definition override issues
}
