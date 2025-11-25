package com.appunture.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.Optional;

@Service
@Slf4j
public class ThumbnailGenerationService {

    private final RestClient restClient;
    private final boolean thumbnailsEnabled;
    private final String functionUrl;
    private final String fallbackQuery;
    private final int defaultWidth;
    private final int defaultHeight;

    public ThumbnailGenerationService(
            @Value("${app.images.thumbnail.enabled:true}") boolean thumbnailsEnabled,
            @Value("${app.images.thumbnail.function-url:}") String functionUrl,
            @Value("${app.images.thumbnail.fallback-query:token=thumb-320}") String fallbackQuery,
            @Value("${app.images.thumbnail.default-width:320}") int defaultWidth,
            @Value("${app.images.thumbnail.default-height:320}") int defaultHeight) {
        this.thumbnailsEnabled = thumbnailsEnabled;
        this.functionUrl = functionUrl;
        this.fallbackQuery = fallbackQuery;
        this.defaultWidth = defaultWidth;
        this.defaultHeight = defaultHeight;
        this.restClient = RestClient.create();
    }

    public Optional<String> resolveThumbnail(String imageUrl, boolean generateThumbnailRequested, String providedThumbnailUrl) {
        if (!StringUtils.hasText(imageUrl)) {
            return Optional.empty();
        }

        if (StringUtils.hasText(providedThumbnailUrl)) {
            return Optional.of(providedThumbnailUrl);
        }

        if (!thumbnailsEnabled || !generateThumbnailRequested) {
            return Optional.empty();
        }

        return requestThumbnailFromFunction(imageUrl)
                .or(() -> Optional.of(buildFallbackUrl(imageUrl)));
    }

    private Optional<String> requestThumbnailFromFunction(String imageUrl) {
        if (!StringUtils.hasText(functionUrl)) {
            return Optional.empty();
        }

        try {
            ThumbnailResponse response = restClient.post()
                    .uri(functionUrl)
                    .body(new ThumbnailRequest(imageUrl, defaultWidth, defaultHeight))
                    .retrieve()
                    .body(ThumbnailResponse.class);

            if (response != null && StringUtils.hasText(response.thumbnailUrl())) {
                return Optional.of(response.thumbnailUrl());
            }
        } catch (Exception ex) {
            log.warn("Falha ao invocar função de thumbnail: {}", ex.getMessage());
        }
        return Optional.empty();
    }

    private String buildFallbackUrl(String imageUrl) {
        if (!StringUtils.hasText(fallbackQuery)) {
            return imageUrl;
        }
        if (imageUrl.contains("?")) {
            return imageUrl + "&" + fallbackQuery;
        }
        return imageUrl + "?" + fallbackQuery;
    }

    private record ThumbnailRequest(String imageUrl, int width, int height) {}

    private record ThumbnailResponse(String thumbnailUrl) {}
}
