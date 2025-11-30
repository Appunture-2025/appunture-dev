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
import { useThemeColors, useThemeStore } from "../../stores/themeStore";
import { SPACING } from "../../utils/constants";
import SearchBar from "../../components/SearchBar";
import PointCard from "../../components/PointCard";

export default function SearchScreen() {
  const colors = useThemeColors();
  const { isDark } = useThemeStore();
  const {
    points,
    searchResults,
    loading,
    loadPoints,
    searchPoints,
    clearSearch,
    toggleFavorite,
  } = usePointsStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await loadPoints();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os pontos.");
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      clearSearch();
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      await searchPoints(query);
    } catch (error) {
      Alert.alert("Erro", "Erro na busca. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePointPress = (pointId: string) => {
    // Navigation will be handled by PointCard component
  };

  const handleToggleFavorite = async (pointId: string) => {
    try {
      await toggleFavorite(pointId);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar favoritos.");
    }
  };

  const displayPoints = isSearching || searchQuery ? searchResults : points;

  const renderPoint = ({ item }: { item: any }) => (
    <PointCard
      point={item}
      onPress={() => handlePointPress(String(item.id))}
      onToggleFavorite={() => handleToggleFavorite(String(item.id))}
      showFavoriteButton={true}
    />
  );

  const renderEmpty = () => (
    <View
      style={styles.emptyContainer}
      accessibilityRole="text"
      accessibilityLabel={
        searchQuery
          ? "Nenhum ponto encontrado para esta busca."
          : "Nenhum ponto disponível."
      }
    >
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {searchQuery
          ? "Nenhum ponto encontrado para esta busca."
          : "Nenhum ponto disponível."}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View
      style={styles.header}
      accessibilityRole="header"
      accessibilityLabel="Busca de pontos"
    >
      <SearchBar
        placeholder="Buscar pontos, meridianos..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={() => handleSearch(searchQuery)}
        loading={isSearching}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={displayPoints}
        renderItem={renderPoint}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadInitialData}
      />

      {(loading || isSearching) && (
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
  listContainer: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
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
