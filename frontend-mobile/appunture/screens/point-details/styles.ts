import { StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../utils/constants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  pointName: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  pointCode: {
    fontSize: 14,
    color: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: SPACING.md,
  },
  pointMeridian: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  favoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: "flex-start",
  },
  favoriteButtonActive: {
    backgroundColor: `${COLORS.error}15`,
    borderColor: COLORS.error,
  },
  favoriteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  favoriteButtonTextActive: {
    color: COLORS.error,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardIcon: {
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  cardContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  indicationsList: {
    gap: SPACING.sm,
  },
  indicationItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  indicationIcon: {
    marginRight: SPACING.sm,
  },
  indicationText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  techniquesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  techniqueChip: {
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  techniqueText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  warningCard: {
    backgroundColor: `${COLORS.error}10`,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.error}30`,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  warningIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
