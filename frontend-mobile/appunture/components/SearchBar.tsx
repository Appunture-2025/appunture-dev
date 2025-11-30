import React, { memo, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../stores/themeStore";
import { SPACING } from "../utils/constants";
import { useDebounce } from "../hooks";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  /** Debounce delay in milliseconds. Set to 0 to disable debouncing. Default: 300ms */
  debounceDelay?: number;
}

/**
 * Optimized SearchBar component with built-in debouncing.
 * Uses React.memo to prevent unnecessary re-renders.
 */
function SearchBarComponent({
  placeholder = "Buscar...",
  value,
  onChangeText,
  onSubmit,
  loading = false,
  debounceDelay = 300,
}: SearchBarProps) {
  const colors = useThemeColors();
  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState(value);

  // Debounced value for triggering search
  const debouncedValue = useDebounce(localValue, debounceDelay);

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Trigger onChangeText when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChangeText(debouncedValue);
    }
  }, [debouncedValue, onChangeText, value]);

  const handleChangeText = useCallback((text: string) => {
    setLocalValue(text);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChangeText("");
  }, [onChangeText]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
          importantForAccessibility="no-hide-descendants"
        />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={localValue}
          onChangeText={handleChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          editable={!loading}
          accessibilityLabel={placeholder}
          accessibilityHint="Digite para buscar"
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            accessibilityLabel="Buscando..."
          />
        )}
        {!loading && localValue.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const SearchBar = memo(SearchBarComponent);

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 25,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: SPACING.xs,
  },
});

export default SearchBar;
