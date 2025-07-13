import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../utils/constants";

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Ionicons name="medical" size={80} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Bem-vindo ao Appunture</Text>
        <Text style={styles.subtitle}>
          Sua referência completa em acupuntura digital
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="search" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>
              Pesquise pontos por sintomas ou localização
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="body" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>
              Explore o mapa corporal interativo
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons
              name="chatbubble-ellipses"
              size={24}
              color={COLORS.primary}
            />
            <Text style={styles.featureText}>
              Converse com o assistente inteligente
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="heart" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Salve seus pontos favoritos</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.primaryButtonText}>Fazer Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.secondaryButtonText}>Continuar sem conta</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Appunture v1.0.0 • Medicina Tradicional Chinesa
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
  },
  features: {
    width: "100%",
    marginBottom: 48,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 16,
    flex: 1,
    lineHeight: 22,
  },
  buttons: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.surface,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  footer: {
    alignItems: "center",
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
