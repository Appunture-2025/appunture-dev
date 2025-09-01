import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../utils/constants";
import { styles } from "./styles";

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
          <View style={styles.featureItem}>
            <Ionicons
              name="map-outline"
              size={20}
              color={COLORS.primary}
              style={styles.featureIcon}
            />
            <Text style={styles.featureText}>
              Mapeamento completo de pontos de acupuntura
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons
              name="search-outline"
              size={20}
              color={COLORS.primary}
              style={styles.featureIcon}
            />
            <Text style={styles.featureText}>
              Busca por sintomas e localização
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons
              name="cloud-outline"
              size={20}
              color={COLORS.primary}
              style={styles.featureIcon}
            />
            <Text style={styles.featureText}>
              Sincronização em nuvem dos seus dados
            </Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.secondaryButtonText}>Criar Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.guestButtonText}>Continuar como visitante</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
