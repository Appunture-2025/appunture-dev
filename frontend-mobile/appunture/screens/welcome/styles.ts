import { StyleSheet } from "react-native";

type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
};

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    logoContainer: {
      marginBottom: 40,
      alignItems: "center",
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 48,
    },
    buttonsContainer: {
      width: "100%",
      gap: 16,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.surface,
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
    },
    guestButton: {
      paddingVertical: 16,
      alignItems: "center",
    },
    guestButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
      textDecorationLine: "underline",
    },
    features: {
      marginTop: 32,
      width: "100%",
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    featureIcon: {
      marginRight: 12,
    },
    featureText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
  });
