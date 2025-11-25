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
import { COLORS } from "../../utils/constants";
import { Ionicons } from "@expo/vector-icons";

interface Symptom {
  id: string;
  name: string;
  description?: string;
}

export default function AdminSymptomsScreen() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSymptoms = async () => {
    try {
      setLoading(true);
      // Mock data for now
      setSymptoms([
        {
          id: "1",
          name: "Dor de Cabeça",
          description: "Cefaleia tensional ou enxaqueca",
        },
        {
          id: "2",
          name: "Ansiedade",
          description: "Sintomas de estresse e nervosismo",
        },
        { id: "3", name: "Insônia", description: "Dificuldade para dormir" },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os sintomas.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const renderItem = ({ item }: { item: Symptom }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>{item.description}</Text>
      </View>
      <TouchableOpacity
        onPress={() => Alert.alert("Ação", `Editar ${item.name}`)}
      >
        <Ionicons name="create-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sintomas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert("Novo", "Criar novo sintoma")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={symptoms}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum sintoma cadastrado.</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  card: {
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
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  details: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: 20,
  },
});
