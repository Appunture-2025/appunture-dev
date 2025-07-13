import React from "react";
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

export default function PointCard({
  point,
  onPress,
  showFavoriteButton = false,
  isFavorite = false,
  onToggleFavorite,
}: PointCardProps) {
  return (
    <View style={styles.container}>
      <Link href={`/point/${point.id}`} asChild>
        <TouchableOpacity style={styles.content} onPress={onPress}>
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
              />
              <Text style={styles.meridian}>{point.meridian}</Text>
            </View>

            <Text style={styles.location}>
              {truncateText(point.location, 100)}
            </Text>

            {point.indications && (
              <Text style={styles.indications}>
                Indicações: {truncateText(point.indications, 80)}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            {showFavoriteButton && onToggleFavorite && (
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
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
