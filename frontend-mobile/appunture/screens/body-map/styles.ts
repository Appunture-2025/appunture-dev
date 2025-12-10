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
    marginBottom: SPACING.lg,
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
  // Meridian selector styles
  meridianSelector: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  meridianList: {
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  meridianChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    minWidth: 48,
    alignItems: "center",
  },
  meridianChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  meridianChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  meridianChipTextActive: {
    color: COLORS.surface,
  },
  // Meridian info styles
  meridianInfo: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  meridianTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  meridianSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Legacy control styles (kept for compatibility)
  controls: {
    marginBottom: SPACING.lg,
  },
  planeToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  planeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: "center",
  },
  planeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  planeButtonText: {
    fontWeight: "600",
    color: COLORS.text,
  },
  planeButtonTextActive: {
    color: COLORS.surface,
  },
  layerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  layerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  layerButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  layerInfo: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    marginHorizontal: SPACING.sm,
  },
  layerInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  layerInfoSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  loadingWrapper: {
    marginTop: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: SPACING.sm,
  },
  pointsSection: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  pointRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pointRowActive: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  pointInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  pointCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    minWidth: 48,
    textAlign: "center",
  },
  pointDetails: {
    flex: 1,
  },
  pointName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  pointChinese: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pointMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pointStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  emptyListText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: SPACING.md,
  },
  // Legend styles
  legendCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  legendText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  // Instructions card styles
  instructionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: SPACING.lg,
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
