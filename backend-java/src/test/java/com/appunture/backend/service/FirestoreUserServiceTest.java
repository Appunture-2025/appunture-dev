package com.appunture.backend.service;

import com.appunture.backend.model.firestore.FirestoreUser;
import com.appunture.backend.repository.firestore.FirestoreUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FirestoreUserServiceTest {

    @Mock
    private FirestoreUserRepository userRepository;

    @InjectMocks
    private FirestoreUserService service;

    @Test
    void createUserPersistsEntityWhenEmailAndUidAreUnique() {
        when(userRepository.existsByEmail("user@appunture.com")).thenReturn(false);
        when(userRepository.existsByFirebaseUid("uid-1")).thenReturn(false);
        when(userRepository.save(any(FirestoreUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FirestoreUser result = service.createUser("uid-1", "user@appunture.com", "User", "ADMIN");

        assertThat(result.getEmail()).isEqualTo("user@appunture.com");
        assertThat(result.getRole()).isEqualTo("ADMIN");
        assertThat(result.isEnabled()).isTrue();
        verify(userRepository).save(any(FirestoreUser.class));
    }

    @Test
    void createUserThrowsWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("user@appunture.com")).thenReturn(true);

        assertThatThrownBy(() -> service.createUser("uid-1", "user@appunture.com", "User", "ADMIN"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email já está em uso");
    }

    @Test
    void updateUserOverridesProvidedFields() {
        FirestoreUser existing = FirestoreUser.builder()
                .id("doc-1")
                .name("Old")
                .email("old@appunture.com")
                .enabled(true)
                .emailVerified(false)
                .build();

        when(userRepository.findById("doc-1")).thenReturn(Optional.of(existing));
        when(userRepository.existsByEmail("new@appunture.com")).thenReturn(false);
        when(userRepository.save(any(FirestoreUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FirestoreUser updates = FirestoreUser.builder()
                .name("New")
                .email("new@appunture.com")
                .profileImageUrl("https://cdn/img.png")
                .phoneNumber("+55 11 90000-0000")
                .role("ADMIN")
                .enabled(false)
                .emailVerified(true)
                .build();

        FirestoreUser result = service.updateUser("doc-1", updates);

        assertThat(result.getName()).isEqualTo("New");
        assertThat(result.getEmail()).isEqualTo("new@appunture.com");
        assertThat(result.getRole()).isEqualTo("ADMIN");
        assertThat(result.isEnabled()).isFalse();
        assertThat(result.isEmailVerified()).isTrue();
        assertThat(result.getProfileImageUrl()).isEqualTo("https://cdn/img.png");
        assertThat(result.getPhoneNumber()).isEqualTo("+55 11 90000-0000");
    }

    @Test
    void addFavoritePointCreatesListWhenMissing() {
        FirestoreUser user = FirestoreUser.builder().id("doc-1").favoritePointIds(null).build();
        when(userRepository.findById("doc-1")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        service.addFavoritePoint("doc-1", "VG20");

        assertThat(user.getFavoritePointIds()).containsExactly("VG20");
    }

    @Test
    void removeFavoritePointRemovesExistingEntry() {
        List<String> favorites = new ArrayList<>(List.of("VG20", "E36"));
        FirestoreUser user = FirestoreUser.builder().id("doc-1").favoritePointIds(favorites).build();
        when(userRepository.findById("doc-1")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        service.removeFavoritePoint("doc-1", "E36");

        assertThat(user.getFavoritePointIds()).containsExactly("VG20");
    }

    @Test
    void toggleUserEnabledFlipsFlag() {
        FirestoreUser user = FirestoreUser.builder().id("doc-1").enabled(true).build();
        when(userRepository.findById("doc-1")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        FirestoreUser result = service.toggleUserEnabled("doc-1");

        assertThat(result.isEnabled()).isFalse();
    }
}