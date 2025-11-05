import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { COLORS } from "../../utils/constants";
import { styles } from "./styles";
import { apiService } from "../../services/api";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, loginWithApple, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Erro", "Por favor, insira um email válido.");
      return;
    }

    try {
      await login({ email: email.trim(), password: password.trim() });
      router.replace("/(tabs)");
    } catch (error: any) {
      if (
        error?.status === 403 &&
        (error?.error === "email_not_verified" ||
          error?.message?.toLowerCase()?.includes("not verified"))
      ) {
        setVerificationMessage(
          `Precisamos confirmar o seu email antes de continuar. Se não recebeu o link, peça um novo envio abaixo.`
        );
        setShowVerificationModal(true);
        return;
      }
      Alert.alert(
        "Erro",
        error.message || "Erro ao fazer login. Tente novamente."
      );
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.replace("/(tabs)");
    } catch (error: any) {
      // Don't show alert for "not implemented" errors
      if (!error.message?.includes("configuração adicional")) {
        Alert.alert(
          "Erro",
          error.message || "Erro ao fazer login com Google. Tente novamente."
        );
      } else {
        Alert.alert("Em desenvolvimento", error.message);
      }
    }
  };

  const handleAppleLogin = async () => {
    try {
      await loginWithApple();
      router.replace("/(tabs)");
    } catch (error: any) {
      // Don't show alert for "not implemented" errors
      if (!error.message?.includes("configuração adicional")) {
        Alert.alert(
          "Erro",
          error.message || "Erro ao fazer login com Apple. Tente novamente."
        );
      } else {
        Alert.alert("Em desenvolvimento", error.message);
      }
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Esqueci minha senha",
      "Digite seu email e enviaremos instruções para redefinir sua senha.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: () => {
            if (!email.trim() || !isValidEmail(email)) {
              Alert.alert(
                "Erro",
                "Por favor, insira um email válido no campo acima."
              );
              return;
            }
            Alert.alert(
              "Email enviado",
              "Instruções para redefinir sua senha foram enviadas para seu email."
            );
          },
        },
      ]
    );
  };

  const handleResendEmail = async () => {
    try {
      setResendingEmail(true);
      const response = await apiService.resendVerificationEmail();
      setVerificationMessage(
        response?.message ??
          `Enviamos um novo link de verificação para ${email || "o seu email"}. Verifique sua caixa de entrada e a pasta de spam.`
      );
      Alert.alert(
        "Email reenviado",
        "Verifique sua caixa de entrada e clique no link para ativar sua conta."
      );
    } catch (error: any) {
      if (error?.status === 429) {
        Alert.alert("Limite atingido", error?.message ?? "Tente novamente em breve.");
      } else if (error?.status === 400) {
        Alert.alert("Conta já verificada", error?.message ?? "Sua conta já está ativa.");
        setShowVerificationModal(false);
      } else {
        Alert.alert("Erro", error?.message ?? "Falha ao reenviar email.");
      }
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Modal
        visible={showVerificationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Verifique seu email</Text>
            <Text style={styles.modalMessage}>
              {verificationMessage
                ? verificationMessage
                : `Enviamos um link de verificação para ${
                    email || "o seu email"
                  }. Verifique sua caixa de entrada e a pasta de spam.`}
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, resendingEmail && styles.disabledButton]}
              onPress={handleResendEmail}
              disabled={resendingEmail}
            >
              {resendingEmail ? (
                <ActivityIndicator color={COLORS.surface} size="small" />
              ) : (
                <Text style={styles.modalButtonText}>Reenviar email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={() => setShowVerificationModal(false)}
            >
              <Text style={styles.modalSecondaryButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="medical" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Appunture</Text>
          <Text style={styles.subtitle}>Acupuntura Digital</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.surface} size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={24} color="#DB4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleAppleLogin}
              disabled={isLoading}
            >
              <Ionicons name="logo-apple" size={24} color={COLORS.text} />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.registerButtonText}>Criar conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.guestButtonText}>Continuar como visitante</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
