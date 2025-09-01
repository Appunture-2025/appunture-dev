import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePointsStore } from "../../stores/pointsStore";
import { COLORS } from "../../utils/constants";
import { styles } from "./styles";
import { Point } from "../../types/api";

const techniques = [
  "Agulha fina",
  "Eletroacupuntura",
  "Moxabustão",
  "Ventosa",
  "Auriculoterapia",
  "Acupressão",
];

export interface PointsState {
  points: Point[];
  favoritePoints: Point[];
  toggleFavorite: (id: string) => Promise<void>;
}

export default function PointDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { points, favoritePoints, toggleFavorite } = usePointsStore();
  const [point, setPoint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundPoint = points.find(p => p.id === id);
      setPoint(foundPoint);
      setLoading(false);
    }
  }, [id, points]);

  const handleToggleFavorite = async () => {
    if (!point) return;
    
    try {
      await toggleFavorite(point.id);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível alterar favorito");
    }
  };

  const isFavorite = favoritePoints.some(p => p.id === point?.id);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!point) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Ponto não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.pointName}>{point.name}</Text>
          <Text style={styles.pointCode}>{point.code}</Text>
          <Text style={styles.pointMeridian}>{point.meridian}</Text>
          
          <TouchableOpacity
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? COLORS.error : COLORS.text}
            />
            <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextActive]}>
              {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização</Text>
          <View style={styles.card}>
            <Ionicons
              name="location"
              size={24}
              color={COLORS.primary}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Posição Anatômica</Text>
            <Text style={styles.cardContent}>
              {point.location || "Localização não disponível"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicações</Text>
          <View style={styles.indicationsList}>
            {point.indications?.length > 0 ? (
              point.indications.map((indication: string, index: number) => (
                <View key={index} style={styles.indicationItem}>
                  <Ionicons
                    name="medical"
                    size={16}
                    color={COLORS.primary}
                    style={styles.indicationIcon}
                  />
                  <Text style={styles.indicationText}>{indication}</Text>
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardContent}>
                  Indicações não disponíveis para este ponto.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Técnicas Aplicáveis</Text>
          <View style={styles.techniquesGrid}>
            {techniques.map((technique, index) => (
              <View key={index} style={styles.techniqueChip}>
                <Text style={styles.techniqueText}>{technique}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Função</Text>
          <View style={styles.card}>
            <Ionicons
              name="flash"
              size={24}
              color={COLORS.primary}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Ação Terapêutica</Text>
            <Text style={styles.cardContent}>
              {point.function || "Função terapêutica não especificada"}
            </Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Ionicons
            name="warning"
            size={24}
            color={COLORS.error}
            style={styles.warningIcon}
          />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Aviso Importante</Text>
            <Text style={styles.warningText}>
              Este aplicativo é apenas para fins educacionais. Sempre consulte um 
              profissional qualificado antes de aplicar qualquer técnica de acupuntura.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
