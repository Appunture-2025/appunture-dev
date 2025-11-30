import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePointsStore } from "../../stores/pointsStore";
import { useAuthStore } from "../../stores/authStore";
import { useThemeColors, useThemeStore } from "../../stores/themeStore";
import { SPACING } from "../../utils/constants";
import PointCard from "../../components/PointCard";

export default function FavoritesScreen() {
  const colors = useThemeColors();
  const { isDark } = useThemeStore();
  const {
    favorites,
    loading,
    loadFavorites,
    toggleFavorite,
    favoritesHasMore,
  } = usePointsStore();
  const { isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    try {
      await loadFavorites();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os favoritos.");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadFavorites();
    } catch (error) {
      Alert.alert("Erro", "Erro ao atualizar favoritos.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && favoritesHasMore) {
      loadFavorites(true);
    }
  };

  const handleToggleFavorite = async (pointId: string) => {
    try {
      await toggleFavorite(pointId);
      // Reload favorites to update the list
      await loadFavorites();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar favoritos.");
    }
  };

  const renderPoint = ({ item }: { item: any }) => (
    <PointCard
      point={item}
      onPress={() => {}}
      onToggleFavorite={() => handleToggleFavorite(String(item.id))}
      showFavoriteButton={true}
      isFavorite={true}
    />
  );

  const renderFooter = () => {
    if (!loading || favorites.length === 0) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View
      style={styles.emptyContainer}
      accessibilityRole="text"
      accessibilityLabel={
        isAuthenticated
          ? "Nenhum favorito ainda. Adicione pontos aos favoritos para vê-los aqui."
          : "Login necessário. Faça login para salvar seus pontos favoritos."
      }
    >
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Nenhum favorito ainda
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {isAuthenticated
          ? "Adicione pontos aos favoritos para vê-los aqui."
          : "Faça login para salvar seus pontos favoritos."}
      </Text>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View
          style={styles.authRequired}
          accessibilityRole="alert"
          accessibilityLabel="Login Necessário. Para usar os favoritos, você precisa fazer login."
        >
          <Text style={[styles.authTitle, { color: colors.text }]}>
            Login Necessário
          </Text>
          <Text style={[styles.authText, { color: colors.textSecondary }]}>
            Para usar os favoritos, você precisa fazer login.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Meus Favoritos
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {favorites.length} ponto{favorites.length !== 1 ? "s" : ""} favoritado
          {favorites.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderPoint}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />

      {loading && favorites.length === 0 && (
        <View
          style={[
            styles.loadingOverlay,
            { backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)" },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
  },
  listContainer: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  authRequired: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  authText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
