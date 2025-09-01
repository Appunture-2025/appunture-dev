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
import { loginStyles } from "../../styles/screens/loginStyles";

export default function LoginScreen() {
  const router = useRouter();
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
      style={loginStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={loginStyles.scrollContent}>
        <View style={loginStyles.header}>
          <View style={loginStyles.logoContainer}>
            <Ionicons name="medical" size={64} color={COLORS.primary} />
          </View>
          <Text style={loginStyles.title}>Appunture</Text>
          <Text style={loginStyles.subtitle}>Acupuntura Digital</Text>
        </View>

        <View style={loginStyles.form}>
          <View style={loginStyles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={loginStyles.input}
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

          <View style={loginStyles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={loginStyles.input}
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
              style={loginStyles.passwordToggle}
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
            style={loginStyles.forgotPassword}
          >
            <Text style={loginStyles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[loginStyles.loginButton, isLoading && loginStyles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.surface} size="small" />
            ) : (
              <Text style={loginStyles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={loginStyles.divider}>
            <View style={loginStyles.dividerLine} />
            <Text style={loginStyles.dividerText}>ou</Text>
            <View style={loginStyles.dividerLine} />
          </View>

          <TouchableOpacity
            style={loginStyles.registerButton}
            onPress={() => router.push("/register")}
          >
            <Text style={loginStyles.registerButtonText}>Criar conta</Text>
          </TouchableOpacity>
        </View>

        <View style={loginStyles.footer}>
          <TouchableOpacity
            style={loginStyles.guestButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={loginStyles.guestButtonText}>Continuar como visitante</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
