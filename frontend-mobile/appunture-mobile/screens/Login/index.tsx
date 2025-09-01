import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import styles from './styles';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulação de login (em um app real, faria requisição para servidor)
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (email === 'demo@exemplo.com' && password === '123456') {
        Alert.alert('Sucesso', 'Login realizado com sucesso!', [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)'),
          },
        ]);
      } else {
        Alert.alert(
          'Erro',
          'E-mail ou senha incorretos. Tente: demo@exemplo.com / 123456'
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Esqueceu a senha?',
      'Funcionalidade em desenvolvimento. Entre em contato com o suporte.'
    );
  };

  const handleRegister = () => {
    // Navegar para tela de registro quando criada
    Alert.alert('Registro', 'Tela de registro em desenvolvimento.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Logo size="large" />
          </View>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>Entre na sua conta para continuar</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="seu@exemplo.com"
              keyboardType="email-address"
              autoComplete="email"
              error={errors.email}
            />

            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
              error={errors.password}
            />

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.rememberContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Lembrar-me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={loading}
            />
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Ainda não tem conta? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Registre-se gratuitamente</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
