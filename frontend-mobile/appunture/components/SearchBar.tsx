import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../utils/constants";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export default function SearchBar({
  placeholder = "Buscar...",
  value,
  onChangeText,
  onSubmit,
  loading = false,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons
          name="search"
          size={20}
          color={COLORS.textSecondary}
          importantForAccessibility="no-hide-descendants"
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          editable={!loading}
          accessibilityLabel={placeholder}
          accessibilityHint="Digite para buscar"
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            accessibilityLabel="Buscando..."
          />
        )}
        {!loading && value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText("")}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
});
