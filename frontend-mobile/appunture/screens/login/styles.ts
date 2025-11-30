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
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 24,
    },
    header: {
      alignItems: "center",
      marginBottom: 48,
    },
    logoContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    form: {
      marginBottom: 32,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 4,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: 12,
      marginLeft: 12,
    },
    passwordToggle: {
      padding: 8,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginBottom: 24,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: colors.primary,
    },
    loginButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 24,
    },
    disabledButton: {
      opacity: 0.6,
    },
    loginButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.surface,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      color: colors.textSecondary,
    },
    socialButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 24,
    },
    socialButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 14,
      gap: 8,
    },
    socialButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    registerButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    registerButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
    },
    footer: {
      alignItems: "center",
    },
    guestButton: {
      padding: 16,
    },
    guestButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
      textDecorationLine: "underline",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modalCard: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
    },
    modalMessage: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 24,
      lineHeight: 22,
    },
    modalButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 12,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.surface,
    },
    modalSecondaryButton: {
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalSecondaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
  });
