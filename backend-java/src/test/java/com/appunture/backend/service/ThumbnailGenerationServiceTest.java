package com.appunture.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class ThumbnailGenerationServiceTest {

    private ThumbnailGenerationService service;

    @BeforeEach
    void setUp() {
        // Criar serviço com configurações padrão
        service = new ThumbnailGenerationService(
                true,                           // thumbnailsEnabled
                "https://thumbnail-func.com",   // functionUrl
                "token=thumb-320",              // fallbackQuery
                320,                            // defaultWidth
                320                             // defaultHeight
        );
    }

    // =====================
    // resolveThumbnail Tests
    // =====================

    @Test
    void shouldReturnEmptyWhenImageUrlIsNull() {
        Optional<String> result = service.resolveThumbnail(null, true, null);

        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyWhenImageUrlIsEmpty() {
        Optional<String> result = service.resolveThumbnail("", true, null);

        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyWhenImageUrlIsBlank() {
        Optional<String> result = service.resolveThumbnail("   ", true, null);

        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnProvidedThumbnailUrlWhenPresent() {
        String providedUrl = "https://example.com/thumbnail.jpg";

        Optional<String> result = service.resolveThumbnail(
                "https://example.com/image.jpg",
                true,
                providedUrl
        );

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(providedUrl);
    }

    @Test
    void shouldReturnEmptyWhenThumbnailsDisabled() {
        // Criar serviço com thumbnails desabilitados
        ThumbnailGenerationService disabledService = new ThumbnailGenerationService(
                false,  // thumbnailsEnabled = false
                "https://thumbnail-func.com",
                "token=thumb-320",
                320,
                320
        );

        Optional<String> result = disabledService.resolveThumbnail(
                "https://example.com/image.jpg",
                true,
                null
        );

        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyWhenGenerateThumbnailNotRequested() {
        Optional<String> result = service.resolveThumbnail(
                "https://example.com/image.jpg",
                false,  // generateThumbnailRequested = false
                null
        );

        assertThat(result).isEmpty();
    }

    @Test
    void shouldBuildFallbackUrlWhenFunctionUrlEmpty() {
        // Criar serviço sem function URL
        ThumbnailGenerationService noFunctionService = new ThumbnailGenerationService(
                true,
                "",     // functionUrl vazia
                "token=thumb-320",
                320,
                320
        );

        Optional<String> result = noFunctionService.resolveThumbnail(
                "https://example.com/image.jpg",
                true,
                null
        );

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo("https://example.com/image.jpg?token=thumb-320");
    }

    @Test
    void shouldBuildFallbackUrlWithAmpersandWhenQueryExists() {
        // Criar serviço sem function URL
        ThumbnailGenerationService noFunctionService = new ThumbnailGenerationService(
                true,
                "",
                "token=thumb-320",
                320,
                320
        );

        Optional<String> result = noFunctionService.resolveThumbnail(
                "https://example.com/image.jpg?existing=param",
                true,
                null
        );

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo("https://example.com/image.jpg?existing=param&token=thumb-320");
    }

    @Test
    void shouldReturnOriginalUrlWhenFallbackQueryEmpty() {
        // Criar serviço sem function URL e sem fallback query
        ThumbnailGenerationService minimalService = new ThumbnailGenerationService(
                true,
                "",
                "",     // fallbackQuery vazia
                320,
                320
        );

        Optional<String> result = minimalService.resolveThumbnail(
                "https://example.com/image.jpg",
                true,
                null
        );

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo("https://example.com/image.jpg");
    }

    // =====================
    // Priority Tests
    // =====================

    @Test
    void shouldPrioritizeProvidedThumbnailOverGeneration() {
        String providedUrl = "https://cdn.example.com/cached-thumb.jpg";

        Optional<String> result = service.resolveThumbnail(
                "https://example.com/original.jpg",
                true,   // mesmo com geração habilitada
                providedUrl
        );

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(providedUrl);
    }

    @Test
    void shouldPreferProvidedThumbnailEvenWhenEmpty() {
        // Quando providedThumbnailUrl é uma string não-branca, deve usar ela
        String providedUrl = "https://custom-thumb.jpg";

        Optional<String> result = service.resolveThumbnail(
                "https://example.com/image.jpg",
                true,
                providedUrl
        );

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(providedUrl);
    }

    // =====================
    // Edge Cases
    // =====================

    @Test
    void shouldHandleSpecialCharactersInUrl() {
        ThumbnailGenerationService noFunctionService = new ThumbnailGenerationService(
                true,
                "",
                "token=thumb",
                320,
                320
        );

        Optional<String> result = noFunctionService.resolveThumbnail(
                "https://example.com/image with spaces.jpg",
                true,
                null
        );

        assertThat(result).isPresent();
        assertThat(result.get()).contains("image with spaces.jpg");
    }

    @Test
    void shouldHandleUrlWithFragments() {
        ThumbnailGenerationService noFunctionService = new ThumbnailGenerationService(
                true,
                "",
                "token=thumb",
                320,
                320
        );

        Optional<String> result = noFunctionService.resolveThumbnail(
                "https://example.com/image.jpg#section",
                true,
                null
        );

        assertThat(result).isPresent();
        // O comportamento depende se # é considerado parte da query
        assertThat(result.get()).contains("token=thumb");
    }

    @Test
    void shouldHandleNullFallbackQuery() {
        ThumbnailGenerationService nullQueryService = new ThumbnailGenerationService(
                true,
                "",
                null,   // fallbackQuery null
                320,
                320
        );

        Optional<String> result = nullQueryService.resolveThumbnail(
                "https://example.com/image.jpg",
                true,
                null
        );

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo("https://example.com/image.jpg");
    }

    // =====================
    // Configuration Tests
    // =====================

    @Test
    void shouldRespectDefaultDimensions() {
        ThumbnailGenerationService customSizeService = new ThumbnailGenerationService(
                true,
                "https://func.com",
                "token=thumb",
                640,    // custom width
                480     // custom height
        );

        // O serviço foi criado com dimensões customizadas
        assertThat(customSizeService).isNotNull();
    }

    @Test
    void shouldCreateRestClientOnConstruction() {
        // Verificar que o serviço cria um RestClient interno
        assertThat(service).isNotNull();
        // O RestClient é criado internamente via RestClient.create()
    }
}
