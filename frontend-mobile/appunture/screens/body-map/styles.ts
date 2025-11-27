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
  },
  pointName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  pointMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyListText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
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
