import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSymptomsStore } from "../../stores/symptomsStore";
import { COLORS, SPACING, SYMPTOM_CATEGORIES } from "../../utils/constants";
import SearchBar from "../../components/SearchBar";
import { Symptom } from "../../types/api";

export default function SymptomsScreen() {
  const router = useRouter();
  const {
    symptoms,
    categories,
    popularSymptoms,
    isLoading,
    fetchSymptoms,
    searchSymptoms,
    fetchCategories,
    fetchPopularSymptoms,
    fetchSymptomsByCategory,
  } = useSymptomsStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        fetchSymptoms(),
        fetchCategories(),
        fetchPopularSymptoms(5),
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os sintomas.");
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      if (selectedCategory) {
        await fetchSymptomsByCategory(selectedCategory);
      } else {
        await fetchSymptoms();
      }
      return;
    }

    try {
      await searchSymptoms(query);
    } catch (error) {
      Alert.alert("Erro", "Erro ao buscar sintomas.");
    }
  };

  const handleCategorySelect = async (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      await fetchSymptoms();
    } else {
      setSelectedCategory(category);
      await fetchSymptomsByCategory(category);
    }
    setSearchQuery("");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
      setSelectedCategory(null);
      setSearchQuery("");
    } catch (error) {
      Alert.alert("Erro", "Erro ao atualizar sintomas.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSymptomPress = (symptom: Symptom) => {
    router.push({
      pathname: "/symptom-details",
      params: { id: symptom.id },
    });
  };

  const renderSymptom = ({ item }: { item: Symptom }) => (
    <TouchableOpacity
      style={styles.symptomCard}
      onPress={() => handleSymptomPress(item)}
    >
      <View style={styles.symptomHeader}>
        <Ionicons
          name="medical-outline"
          size={24}
          color={COLORS.primary}
          style={styles.symptomIcon}
        />
        <View style={styles.symptomInfo}>
          <Text style={styles.symptomName}>{item.name}</Text>
          {item.category && (
            <Text style={styles.symptomCategory}>{item.category}</Text>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={COLORS.textSecondary}
        />
      </View>
      {item.description && (
        <Text style={styles.symptomDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      {item.severity !== undefined && (
        <View style={styles.severityContainer}>
          <Text style={styles.severityLabel}>Severidade:</Text>
          <View style={styles.severityBar}>
            <View
              style={[
                styles.severityFill,
                { width: `${(item.severity / 10) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.severityValue}>{item.severity}/10</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCategory = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.categoryChipActive,
      ]}
      onPress={() => handleCategorySelect(category)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category && styles.categoryTextActive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="medical-outline" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>Nenhum sintoma encontrado</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? "Tente buscar com outras palavras."
          : "Não há sintomas cadastrados."}
      </Text>
    </View>
  );

  const displayedSymptoms = symptoms.length > 0 ? symptoms : popularSymptoms;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sintomas</Text>
        <Text style={styles.subtitle}>
          {displayedSymptoms.length} sintoma
          {displayedSymptoms.length !== 1 ? "s" : ""} encontrado
          {displayedSymptoms.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Buscar sintomas..."
          onSubmit={() => handleSearch(searchQuery)}
        />
      </View>

      {(categories.length > 0 || SYMPTOM_CATEGORIES.length > 0) && (
        <View style={styles.categoriesContainer}>
          <Text style={styles.categoriesTitle}>Categorias:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {(categories.length > 0 ? categories : SYMPTOM_CATEGORIES).map(
              renderCategory
            )}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={displayedSymptoms}
        renderItem={renderSymptom}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {isLoading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  categoriesContainer: {
    paddingBottom: SPACING.md,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text,
  },
  categoryTextActive: {
    color: COLORS.surface,
    fontWeight: "600",
  },
  listContainer: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  symptomCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  symptomHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  symptomIcon: {
    marginRight: SPACING.sm,
  },
  symptomInfo: {
    flex: 1,
  },
  symptomName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  symptomCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  symptomDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  severityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  severityLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  severityBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
    marginRight: SPACING.xs,
  },
  severityFill: {
    height: "100%",
    backgroundColor: COLORS.warning,
  },
  severityValue: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    minWidth: 35,
    textAlign: "right",
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
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});
