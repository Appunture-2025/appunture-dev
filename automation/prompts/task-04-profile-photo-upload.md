# Prompt – Upload Foto de Perfil

## Contexto

- `profile-edit.tsx` linha 88 tem TODO para upload de foto
- Backend já tem endpoint `/storage/upload` funcional
- Firebase Storage configurado

## Objetivo

Implementar upload de foto de perfil do usuário com preview e integração com backend.

## Implementação

### 1. Criar serviço de upload de imagem

Criar `frontend-mobile/appunture/services/imageUpload.ts`:

```typescript
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { apiService } from "./api";
import { Platform } from "react-native";

export interface UploadResult {
  url: string;
  thumbnailUrl?: string;
}

export const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Permissão de acesso à galeria negada");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1], // Quadrado para foto de perfil
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
};

export const takePhoto = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Permissão de câmera negada");
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
};

export const compressImage = async (uri: string): Promise<string> => {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 500, height: 500 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipulated.uri;
};

export const uploadProfileImage = async (
  uri: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  // Comprimir antes de enviar
  const compressedUri = await compressImage(uri);

  // Criar FormData
  const formData = new FormData();

  const filename = `profile_${Date.now()}.jpg`;
  const file = {
    uri:
      Platform.OS === "ios"
        ? compressedUri.replace("file://", "")
        : compressedUri,
    type: "image/jpeg",
    name: filename,
  } as any;

  formData.append("file", file);
  formData.append("type", "profile");

  // Upload via API
  const result = await apiService.uploadFile(formData, onProgress);

  return result;
};
```

### 2. Atualizar profile-edit.tsx

```tsx
// Adicionar imports
import {
  pickImage,
  takePhoto,
  uploadProfileImage,
} from "../services/imageUpload";
import { Image } from "react-native";

export default function ProfileEditScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.profileImageUrl || null
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleChangePhoto = async () => {
    Alert.alert("Alterar Foto", "Escolha uma opção", [
      {
        text: "Tirar Foto",
        onPress: async () => {
          try {
            const uri = await takePhoto();
            if (uri) await processImage(uri);
          } catch (error: any) {
            Alert.alert("Erro", error.message);
          }
        },
      },
      {
        text: "Escolher da Galeria",
        onPress: async () => {
          try {
            const uri = await pickImage();
            if (uri) await processImage(uri);
          } catch (error: any) {
            Alert.alert("Erro", error.message);
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const processImage = async (uri: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Preview local imediato
      setProfileImage(uri);

      // Upload para servidor
      const result = await uploadProfileImage(uri, (progress) => {
        setUploadProgress(progress);
      });

      // Atualizar perfil com URL do servidor
      await updateProfile({
        name: name.trim(),
        profileImageUrl: result.url,
      });

      setProfileImage(result.url);
      Alert.alert("Sucesso", "Foto atualizada com sucesso!");
    } catch (error: any) {
      // Reverter preview se falhar
      setProfileImage(user?.profileImageUrl || null);
      Alert.alert("Erro", error.message || "Falha ao enviar foto");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    // ...
    <View style={styles.photoSection}>
      <View style={styles.photoContainer}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={60} color={COLORS.primary} />
          </View>
        )}

        {isUploading && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.uploadProgress}>{uploadProgress}%</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.changePhotoButton}
          onPress={handleChangePhoto}
          disabled={isUploading}
        >
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Adicionar estilos
const styles = StyleSheet.create({
  // ...existing styles...
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadProgress: {
    color: "#fff",
    marginTop: 4,
    fontSize: 12,
  },
});
```

### 3. Atualizar authStore para suportar profileImageUrl

```typescript
// types/user.ts - verificar se existe
interface User {
  // ...existing fields...
  profileImageUrl?: string;
}

// stores/authStore.ts - updateProfile
updateProfile: async (data: { name: string; profession?: string; profileImageUrl?: string }) => {
  // ...existing code...
},
```

### 4. Criar teste

```typescript
// __tests__/services/imageUpload.test.ts
import { compressImage } from "../../services/imageUpload";

jest.mock("expo-image-manipulator");

describe("Image Upload", () => {
  it("should compress image to 500x500", async () => {
    // Test compression
  });

  it("should create correct FormData", async () => {
    // Test FormData creation
  });
});
```

## Critérios de Aceitação

- [ ] Usuário pode escolher foto da galeria
- [ ] Usuário pode tirar foto com câmera
- [ ] Imagem é comprimida antes de upload (500x500, 70% quality)
- [ ] Progress bar durante upload
- [ ] Preview imediato (antes do upload concluir)
- [ ] URL salva no perfil do usuário
- [ ] Tratamento de erros (permissão negada, falha de rede)

## Rollback

Se upload falhar, reverter para foto anterior e mostrar mensagem de erro.
