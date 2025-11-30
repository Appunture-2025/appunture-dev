import React, { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Point } from "../types/api";
import { COLORS, SPACING } from "../utils/constants";
import { truncateText } from "../utils/helpers";

interface PointCardProps {
  point: Point;
  onPress: () => void;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

/**
 * Memoized PointCard component for optimal FlatList performance.
 * Uses React.memo to prevent unnecessary re-renders when props haven't changed.
 */
function PointCardComponent({
  point,
  onPress,
  showFavoriteButton = false,
  isFavorite = false,
  onToggleFavorite,
}: PointCardProps) {
  // Memoize the favorite toggle handler to prevent re-renders
  const handleToggleFavorite = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onToggleFavorite?.();
    },
    [onToggleFavorite]
  );

  return (
    <View style={styles.container}>
      <Link href={`/point/${point.id}`} asChild>
        <TouchableOpacity
          style={styles.content}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Ponto ${point.name}. Meridiano ${point.meridian}. Localização: ${point.location}`}
          accessibilityHint="Toque para ver detalhes do ponto"
        >
          <View style={styles.mainContent}>
            <View style={styles.header}>
              <Text style={styles.name}>{point.name}</Text>
              {point.chinese_name && (
                <Text style={styles.chineseName}>({point.chinese_name})</Text>
              )}
            </View>

            <View style={styles.meridianContainer}>
              <Ionicons
                name="radio-button-on"
                size={12}
                color={COLORS.primary}
                importantForAccessibility="no-hide-descendants"
              />
              <Text style={styles.meridian}>{point.meridian}</Text>
            </View>

            <Text style={styles.location} numberOfLines={2}>
              {truncateText(point.location, 100)}
            </Text>

            {point.indications && (
              <Text style={styles.indications} numberOfLines={2}>
                Indicações: {truncateText(point.indications, 80)}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            {showFavoriteButton && onToggleFavorite && (
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={handleToggleFavorite}
                accessibilityRole="button"
                accessibilityLabel={
                  isFavorite
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
                }
                accessibilityHint={
                  isFavorite
                    ? "Remove este ponto da sua lista de favoritos"
                    : "Adiciona este ponto à sua lista de favoritos"
                }
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorite ? COLORS.error : COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}

            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textSecondary}
              importantForAccessibility="no-hide-descendants"
            />
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    padding: SPACING.md,
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  chineseName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  meridianContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  meridian: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  location: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  indications: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
});

/**
 * Custom comparison function for React.memo to optimize re-renders.
 * Only re-renders when relevant props change.
 */
function arePropsEqual(prevProps: PointCardProps, nextProps: PointCardProps) {
  return (
    prevProps.point.id === nextProps.point.id &&
    prevProps.point.name === nextProps.point.name &&
    prevProps.point.meridian === nextProps.point.meridian &&
    prevProps.point.location === nextProps.point.location &&
    prevProps.point.indications === nextProps.point.indications &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.showFavoriteButton === nextProps.showFavoriteButton &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.onToggleFavorite === nextProps.onToggleFavorite
  );
}

// Memoized export for optimal FlatList performance
const PointCard = memo(PointCardComponent, arePropsEqual);

export default PointCard;
