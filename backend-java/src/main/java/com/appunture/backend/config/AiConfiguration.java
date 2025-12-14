package com.appunture.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "ai")
public class AiConfiguration {
    private boolean enabled = true;
    private String projectId = "appunture-tcc";
    private String location = "us-central1";
    private String model = "gemini-2.5-flash";
    private double temperature = 0.3;
}