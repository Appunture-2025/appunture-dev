import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useThemeColors } from "../../stores/themeStore";
import { apiService } from "../../services/api";
import { User } from "../../types/user";
import { Ionicons } from "@expo/vector-icons";

export default function AdminUsersScreen() {
  const colors = useThemeColors();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os usuários.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderItem = ({ item }: { item: User }) => (
    <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {item.name || "Sem nome"}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {item.email}
        </Text>
        <Text style={[styles.userRole, { color: colors.primary }]}>
          Role: {item.role}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => Alert.alert("Ação", `Editar ${item.name}`)}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || item.email}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhum usuário encontrado.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: 20,
  },
});
