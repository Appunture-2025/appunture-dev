import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../utils/constants";
import { styles } from "./styles";

const bodyRegions = [
  { name: "Cabeça", icon: "head", count: 45 },
  { name: "Pescoço", icon: "body", count: 12 },
  { name: "Ombros", icon: "body", count: 18 },
  { name: "Braços", icon: "arm", count: 32 },
  { name: "Mãos", icon: "hand", count: 24 },
  { name: "Peito", icon: "body", count: 16 },
  { name: "Abdômen", icon: "body", count: 28 },
  { name: "Costas", icon: "body", count: 35 },
  { name: "Pernas", icon: "leg", count: 42 },
  { name: "Pés", icon: "foot", count: 26 },
];

export default function BodyMapScreen() {
  const router = useRouter();

  const handleRegionPress = (region: string) => {
    router.push(`/search?region=${encodeURIComponent(region)}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header} accessibilityRole="header">
          <Text style={styles.title}>Mapa Corporal</Text>
          <Text style={styles.subtitle}>
            Explore os pontos de acupuntura organizados por região do corpo
          </Text>
        </View>

        <View style={styles.bodyMapContainer}>
          <View style={styles.bodyMap}>
            <View
              style={styles.bodyMapPlaceholder}
              accessibilityLabel="Mapa interativo em desenvolvimento"
            >
              <Ionicons
                name="body"
                size={120}
                color={COLORS.primary}
                importantForAccessibility="no-hide-descendants"
              />
              <Text style={styles.bodyMapText}>
                Mapa interativo em desenvolvimento
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.regionsContainer}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Regiões do Corpo
          </Text>
          <View style={styles.regionGrid}>
            {bodyRegions.map((region) => (
              <TouchableOpacity
                key={region.name}
                style={styles.regionCard}
                onPress={() => handleRegionPress(region.name)}
                accessibilityRole="button"
                accessibilityLabel={`Região ${region.name}, ${region.count} pontos`}
                accessibilityHint="Toque para ver pontos desta região"
              >
                <Ionicons
                  name={region.icon as any}
                  size={32}
                  color={COLORS.primary}
                  style={styles.regionIcon}
                  importantForAccessibility="no-hide-descendants"
                />
                <Text style={styles.regionName}>{region.name}</Text>
                <Text style={styles.regionCount}>{region.count} pontos</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.instructionsCard} accessibilityRole="summary">
          <Ionicons
            name="information-circle"
            size={24}
            color={COLORS.primary}
            style={styles.instructionsIcon}
            importantForAccessibility="no-hide-descendants"
          />
          <View style={styles.instructionsContent}>
            <Text style={styles.instructionsTitle}>Como usar</Text>
            <Text style={styles.instructionsText}>
              Toque em uma região do corpo para ver todos os pontos de
              acupuntura disponíveis nessa área. Você também pode usar a busca
              para encontrar pontos específicos.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
