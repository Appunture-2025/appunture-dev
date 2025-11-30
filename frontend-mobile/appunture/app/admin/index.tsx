import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../stores/themeStore";

interface AdminCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  description: string;
  colors: ReturnType<typeof useThemeColors>;
}

const AdminCard = ({
  title,
  icon,
  route,
  description,
  colors,
}: AdminCardProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => router.push(route as any)}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

export default function AdminDashboard() {
  const colors = useThemeColors();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          Bem-vindo, Administrador
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Gerencie o conteúdo do aplicativo
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <AdminCard
          title="Usuários"
          icon="people"
          route="/admin/users"
          description="Gerenciar usuários e permissões"
          colors={colors}
        />
        <AdminCard
          title="Pontos"
          icon="location"
          route="/admin/points"
          description="Adicionar, editar ou remover pontos"
          colors={colors}
        />
        <AdminCard
          title="Sintomas"
          icon="medical"
          route="/admin/symptoms"
          description="Gerenciar sintomas e associações"
          colors={colors}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  cardsContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
