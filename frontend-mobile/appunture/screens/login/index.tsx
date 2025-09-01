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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { COLORS } from "../../utils/constants";
import { styles } from "./styles";

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
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
