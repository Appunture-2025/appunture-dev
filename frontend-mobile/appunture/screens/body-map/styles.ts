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
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  bodyMapContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  bodyMap: {
    width: 300,
    height: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  bodyMapPlaceholder: {
    alignItems: "center",
  },
  bodyMapText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  regionsContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  regionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  regionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: "47%",
    alignItems: "center",
  },
  regionIcon: {
    marginBottom: SPACING.sm,
  },
  regionName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  regionCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  instructionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  instructionsIcon: {
    marginRight: SPACING.md,
    marginTop: 2,
  },
  instructionsContent: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  instructionsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
