import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { usePointsStore } from "../../stores/pointsStore";
import { useSyncStore } from "../../stores/syncStore";
import { useAuthStore } from "../../stores/authStore";
import { COLORS, SPACING, MERIDIANS } from "../../utils/constants";
import { homeStyles } from "../../styles/screens/homeStyles";

export default function HomeScreen() {
  const { points, loading, loadPoints } = usePointsStore();
  const { isOnline, lastSync, syncAll, syncInProgress } = useSyncStore();
  const { user, isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await loadPoints({ limit: 10 });
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (isOnline) {
        await syncAll();
      }
      await loadPoints({ limit: 10 });
    } catch (error) {
      Alert.alert(
        "Erro de Sincronização",
        "Não foi possível sincronizar os dados. Verifique sua conexão.",
        [{ text: "OK" }]
      );
    } finally {
      setRefreshing(false);
    }
  };

  const recentPoints = points.slice(0, 5);
  const meridianStats = MERIDIANS.map((meridian) => ({
    name: meridian,
    count: points.filter((p) => p.meridian === meridian).length,
  })).filter((m) => m.count > 0);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={homeStyles.container}>
        <View style={homeStyles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={homeStyles.loadingText}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={homeStyles.container}>
      <ScrollView style={homeStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={homeStyles.header}>
          <Text style={homeStyles.title}>Appunture</Text>
          <Text style={homeStyles.subtitle}>
            {isAuthenticated
              ? `Bem-vindo, ${user?.name || "Usuário"}!`
              : "Seu guia de acupuntura"}
          </Text>
        </View>

        {/* Status Bar */}
        <View style={homeStyles.statusBar}>
          <View style={homeStyles.statusItem}>
            <Ionicons
              name={isOnline ? "cloud-done" : "cloud-offline"}
              size={20}
              color={isOnline ? COLORS.success : COLORS.error}
            />
            <Text
              style={[
                homeStyles.statusText,
                { color: isOnline ? COLORS.success : COLORS.error },
              ]}
            >
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>

          {lastSync && (
            <View style={homeStyles.statusItem}>
              <Ionicons name="sync" size={16} color={COLORS.textSecondary} />
              <Text style={homeStyles.statusText}>
                Última sync: {new Date(lastSync).toLocaleDateString("pt-BR")}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={homeStyles.refreshButton}
            onPress={handleRefresh}
            disabled={syncInProgress || refreshing}
          >
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={homeStyles.section}>
          <Text style={homeStyles.sectionTitle}>Acesso Rápido</Text>
          <View style={homeStyles.quickActions}>
            <Link href="/search" asChild>
              <TouchableOpacity style={homeStyles.actionCard}>
                <Ionicons name="search" size={32} color={COLORS.primary} />
                <Text style={homeStyles.actionText}>Buscar Pontos</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/body-map" asChild>
              <TouchableOpacity style={homeStyles.actionCard}>
                <Ionicons name="body" size={32} color={COLORS.secondary} />
                <Text style={homeStyles.actionText}>Mapa Corporal</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/chatbot" asChild>
              <TouchableOpacity style={homeStyles.actionCard}>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={32}
                  color={COLORS.accent}
                />
                <Text style={homeStyles.actionText}>Assistente</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/favorites" asChild>
              <TouchableOpacity style={homeStyles.actionCard}>
                <Ionicons name="heart" size={32} color={COLORS.error} />
                <Text style={homeStyles.actionText}>Favoritos</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Recent Points */}
        {recentPoints.length > 0 && (
          <View style={homeStyles.section}>
            <View style={homeStyles.sectionHeader}>
              <Text style={homeStyles.sectionTitle}>Pontos Recentes</Text>
              <Link href="/search" asChild>
                <TouchableOpacity>
                  <Text style={homeStyles.seeAllText}>Ver todos</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {recentPoints.map((point) => (
              <Link key={point.id} href={`/point/${String(point.id)}`} asChild>
                <TouchableOpacity style={homeStyles.pointCard}>
                  <View>
                    <Text style={homeStyles.pointName}>{point.name}</Text>
                    <Text style={homeStyles.pointMeridian}>{point.meridian}</Text>
                    <Text style={homeStyles.pointLocation} numberOfLines={2}>
                      {point.location}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        )}

        {/* Meridian Stats */}
        {meridianStats.length > 0 && (
          <View style={homeStyles.section}>
            <Text style={homeStyles.sectionTitle}>Meridianos Disponíveis</Text>
            <View style={homeStyles.meridianGrid}>
              {meridianStats.slice(0, 6).map((meridian) => (
                <View key={meridian.name} style={homeStyles.meridianCard}>
                  <Text style={homeStyles.meridianName}>{meridian.name}</Text>
                  <Text style={homeStyles.meridianCount}>
                    {meridian.count} pontos
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tips */}
        <View style={homeStyles.section}>
          <Text style={homeStyles.sectionTitle}>Dica do Dia</Text>
          <View style={homeStyles.tipCard}>
            <Ionicons name="bulb" size={24} color={COLORS.accent} />
            <Text style={homeStyles.tipText}>
              Use o assistente para encontrar pontos baseados em sintomas. Basta
              descrever o que você está sentindo!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
