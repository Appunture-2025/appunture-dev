import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { COLORS, PROFESSIONS } from "../utils/constants";
import { mediaStorageService } from "../services/storage";
import { apiService } from "../services/api";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuthStore();

  const [name, setName] = useState(user?.name || "");
  const [profession, setProfession] = useState(user?.profession || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [showProfessionPicker, setShowProfessionPicker] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(
    user?.profileImageUrl || null
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setProfession(user.profession || "");
      setPhone(user.phoneNumber || "");
      setProfileImageUri(user.profileImageUrl || null);
    }
  }, [user]);

  const handleSelectPhoto = () => {
    Alert.alert("Foto de Perfil", "Como deseja adicionar sua foto?", [
      {
        text: "Galeria",
        onPress: handlePickFromGallery,
      },
      {
        text: "Câmera",
        onPress: handleTakePhoto,
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  const handlePickFromGallery = async () => {
    try {
      const assets = await mediaStorageService.pickImage(false);
      if (assets.length > 0) {
        await uploadProfilePhoto(assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.message || "Não foi possível selecionar a imagem."
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      const asset = await mediaStorageService.takePicture();
      if (asset) {
        await uploadProfilePhoto(asset.uri);
      }
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível tirar a foto.");
    }
  };

  const uploadProfilePhoto = async (uri: string) => {
    try {
      setIsUploadingPhoto(true);
      setUploadProgress(0);

      // Upload image to Firebase Storage via backend
      const uploadedUrl = await mediaStorageService.uploadImage(
        uri,
        (progress) => setUploadProgress(progress)
      );

      // Update profile with new image URL
      await apiService.updateProfile({
        name: name.trim() || user?.name || "",
        profileImageUrl: uploadedUrl,
      });

      setProfileImageUri(uploadedUrl);
      Alert.alert("Sucesso", "Foto de perfil atualizada!");
    } catch (error: any) {
      console.error("Error uploading profile photo:", error);
      Alert.alert(
        "Erro",
        error.message || "Não foi possível fazer upload da foto."
      );
    } finally {
      setIsUploadingPhoto(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome é obrigatório.");
      return;
    }

    try {
      await updateProfile({
        name: name.trim(),
        profession: profession.trim() || undefined,
      });
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.message || "Não foi possível atualizar o perfil."
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {profileImageUri ? (
              <Image
                source={{ uri: profileImageUri }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={60} color={COLORS.primary} />
              </View>
            )}
            {isUploadingPhoto ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color={COLORS.surface} size="small" />
                <Text style={styles.uploadProgressText}>
                  {Math.round(uploadProgress * 100)}%
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={handleSelectPhoto}
              >
                <Ionicons name="camera" size={20} color={COLORS.surface} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.photoHint}>Toque para alterar a foto</Text>
        </View>

        {/* Email Verification Badge */}
        <View style={styles.verificationContainer}>
          <View
            style={[
              styles.verificationBadge,
              {
                backgroundColor: user?.emailVerified
                  ? COLORS.success
                  : COLORS.warning,
              },
            ]}
          >
            <Ionicons
              name={user?.emailVerified ? "checkmark-circle" : "alert-circle"}
              size={16}
              color={COLORS.surface}
            />
            <Text style={styles.verificationText}>
              {user?.emailVerified
                ? "Email verificado"
                : "Email não verificado"}
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nome *</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor={COLORS.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email Field (Read-only) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, styles.readOnlyInput]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.readOnlyText}>{user?.email}</Text>
            </View>
            <Text style={styles.hint}>O email não pode ser alterado</Text>
          </View>

          {/* Profession Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Profissão</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowProfessionPicker(true)}
            >
              <Ionicons
                name="briefcase-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text
                style={[styles.input, !profession && styles.placeholderText]}
              >
                {profession || "Selecione sua profissão"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Phone Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Telefone</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor={COLORS.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
            <Text style={styles.hint}>Disponível em breve</Text>
          </View>

          {/* Role Display (Read-only) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tipo de conta</Text>
            <View style={[styles.inputContainer, styles.readOnlyInput]}>
              <Ionicons
                name="shield-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.readOnlyText}>
                {user?.role === "admin" || user?.role === "ADMIN"
                  ? "Administrador"
                  : "Usuário"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.surface} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Profession Picker Modal */}
      {showProfessionPicker && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione sua profissão</Text>
              <TouchableOpacity onPress={() => setShowProfessionPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {PROFESSIONS.map((prof) => (
                <TouchableOpacity
                  key={prof}
                  style={styles.modalItem}
                  onPress={() => {
                    setProfession(prof);
                    setShowProfessionPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      profession === prof && styles.modalItemTextSelected,
                    ]}
                  >
                    {prof}
                  </Text>
                  {profession === prof && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  photoSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  photoContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  photoHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  verificationContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.surface,
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 54,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 12,
    marginLeft: 12,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  readOnlyInput: {
    backgroundColor: COLORS.background,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 12,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginLeft: 4,
  },
  actions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.surface,
  },
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: "85%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  modalItemTextSelected: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadProgressText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});
