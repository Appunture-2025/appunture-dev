import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { COLORS } from "../../utils/constants";
import { useThemeColors } from "../../stores/themeStore";
import { loginStyles } from "../../styles/screens/loginStyles";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      Alert.alert(
        "Erro",
        error.message || "Erro ao fazer login. Tente novamente."
      );
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

  return (
    <KeyboardAvoidingView
      style={[loginStyles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={loginStyles.scrollContent}>
        <View style={loginStyles.header}>
          <View style={[loginStyles.logoContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="medical" size={64} color={colors.primary} />
          </View>
          <Text style={[loginStyles.title, { color: colors.text }]}>Appunture</Text>
          <Text style={[loginStyles.subtitle, { color: colors.textSecondary }]}>Acupuntura Digital</Text>
        </View>

        <View style={loginStyles.form}>
          <View style={[loginStyles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              style={[loginStyles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>

          <View style={[loginStyles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              style={[loginStyles.input, { color: colors.text }]}
              placeholder="Senha"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={loginStyles.passwordToggle}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleForgotPassword}
            style={loginStyles.forgotPassword}
          >
            <Text style={[loginStyles.forgotPasswordText, { color: colors.primary }]}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[loginStyles.loginButton, { backgroundColor: colors.primary }, isLoading && loginStyles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <Text style={[loginStyles.loginButtonText, { color: colors.surface }]}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={loginStyles.divider}>
            <View style={[loginStyles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[loginStyles.dividerText, { color: colors.textSecondary }]}>ou</Text>
            <View style={[loginStyles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[loginStyles.registerButton, { borderColor: colors.primary }]}
            onPress={() => router.push("/register")}
          >
            <Text style={[loginStyles.registerButtonText, { color: colors.primary }]}>Criar conta</Text>
          </TouchableOpacity>
        </View>

        <View style={loginStyles.footer}>
          <TouchableOpacity
            style={loginStyles.guestButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={[loginStyles.guestButtonText, { color: colors.textSecondary }]}>Continuar como visitante</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
