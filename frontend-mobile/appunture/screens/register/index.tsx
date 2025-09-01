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
import { styles } from "./styles";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

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

    if (!acceptTerms) {
      Alert.alert("Erro", "Você deve aceitar os termos de uso para continuar.");
      return;
    }

    try {
      await register(name.trim(), email.trim(), password);
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
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="person-add" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Junte-se ao Appunture e tenha acesso completo aos recursos da plataforma
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.name}
              onChangeText={(value) => updateFormData("name", value)}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />
          </View>

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
              value={formData.email}
              onChangeText={(value) => updateFormData("email", value)}
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
              placeholder="Senha (mínimo 6 caracteres)"
              placeholderTextColor={COLORS.textSecondary}
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
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              placeholderTextColor={COLORS.textSecondary}
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
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAcceptTerms(!acceptTerms)}
          >
            <View
              style={[styles.checkbox, acceptTerms && styles.checkedCheckbox]}
            >
              {acceptTerms && (
                <Ionicons name="checkmark" size={12} style={styles.checkmark} />
              )}
            </View>
            <Text style={styles.termsText}>
              Eu aceito os <Text style={styles.termsLink}>termos de uso</Text> e{" "}
              <Text style={styles.termsLink}>política de privacidade</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.surface} size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Criar Conta</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.loginButtonText}>Já tenho uma conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
