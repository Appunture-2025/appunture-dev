import { StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../utils/constants";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  refreshButton: {
    padding: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  actionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
    gap: SPACING.sm,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
  },
  pointCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  pointMeridian: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  pointLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  meridianGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  meridianCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  meridianName: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
    textAlign: "center",
  },
  meridianCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  tipCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
});
