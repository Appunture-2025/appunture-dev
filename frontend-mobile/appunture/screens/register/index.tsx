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
import { styles } from "./styles";

export default function RegisterScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = formData;

    // Validation
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Erro", "Por favor, insira um email válido.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }


    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      Alert.alert(
        "Sucesso",
        "Conta criada com sucesso! Você pode fazer login agora.",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.message || "Erro ao criar conta. Tente novamente."
      );
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="person-add" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Criar Conta</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Junte-se ao Appunture e tenha acesso completo aos recursos da plataforma
          </Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Nome completo"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(value) => updateFormData("name", value)}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(value) => updateFormData("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Senha (mínimo 6 caracteres)"
              placeholderTextColor={colors.textSecondary}
              value={formData.password}
              onChangeText={(value) => updateFormData("password", value)}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirmar senha"
              placeholderTextColor={colors.textSecondary}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData("confirmPassword", value)}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.passwordToggle}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.primary }, isLoading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <Text style={[styles.registerButtonText, { color: colors.surface }]}>Criar Conta</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { borderColor: colors.primary }]}
            onPress={() => router.replace("/login")}
          >
            <Text style={[styles.loginButtonText, { color: colors.primary }]}>Já tenho uma conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
