# Prompt – Implementar Google Sign-In

## Contexto

- `authStore.ts` tem placeholder para `loginWithGoogle` que lança erro
- Firebase Auth já está configurado
- Precisa funcionar em React Native (mobile) e Web

## Objetivo

Implementar autenticação com Google no frontend mobile usando Firebase Auth.

## Dependências Necessárias

```bash
cd frontend-mobile/appunture
npm install @react-native-google-signin/google-signin
npx expo install expo-auth-session expo-crypto expo-web-browser
```

## Implementação

### 1. Criar serviço de Google Auth

Criar arquivo `frontend-mobile/appunture/services/googleAuth.ts`:

```typescript
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { firebaseAuth } from "./firebase";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

// IDs do Firebase Console > Authentication > Sign-in method > Google
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  const signInWithGoogle = async () => {
    const result = await promptAsync();

    if (result?.type === "success") {
      const { id_token } = result.params;
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(
        firebaseAuth,
        credential
      );
      return userCredential;
    }

    throw new Error("Google Sign-In cancelado ou falhou");
  };

  return { request, signInWithGoogle, isReady: !!request };
};
```

### 2. Atualizar authStore.ts

Editar `frontend-mobile/appunture/stores/authStore.ts`:

```typescript
// Substituir o placeholder loginWithGoogle por:
loginWithGoogle: async () => {
  try {
    set({ isLoading: true });

    // Para Expo, usar hook em componente
    // Este método será chamado pelo componente que usa useGoogleAuth
    throw new Error(
      'Use o hook useGoogleAuth no componente de login. ' +
      'Exemplo: const { signInWithGoogle } = useGoogleAuth();'
    );
  } catch (error) {
    set({ isLoading: false });
    throw error;
  }
},

// Adicionar método para processar credential do Google
processGoogleCredential: async (userCredential: UserCredential) => {
  try {
    set({ isLoading: true });

    const idToken = await userCredential.user.getIdToken(true);
    await storeToken(idToken);

    let profile: User | null = null;
    try {
      profile = await apiService.getProfile();
    } catch {
      profile = await apiService.syncFirebaseUser();
    }

    await storeUserData(profile);

    set({
      user: profile,
      token: idToken,
      isAuthenticated: true,
      isLoading: false,
    });
  } catch (error) {
    set({ isLoading: false });
    throw error;
  }
},
```

### 3. Atualizar tela de Login

Editar `frontend-mobile/appunture/app/login.tsx`:

```tsx
import { useGoogleAuth } from "../services/googleAuth";

export default function LoginScreen() {
  const { signInWithGoogle, isReady } = useGoogleAuth();
  const { processGoogleCredential, isLoading } = useAuthStore();

  const handleGoogleSignIn = async () => {
    try {
      const credential = await signInWithGoogle();
      await processGoogleCredential(credential);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  return (
    // ... existing code ...
    <TouchableOpacity
      style={styles.googleButton}
      onPress={handleGoogleSignIn}
      disabled={!isReady || isLoading}
    >
      <Ionicons name="logo-google" size={20} color="#fff" />
      <Text style={styles.googleButtonText}>Entrar com Google</Text>
    </TouchableOpacity>
  );
}
```

### 4. Atualizar .env.example

```env
# Google OAuth (do Firebase Console)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

### 5. Criar teste

```typescript
// __tests__/services/googleAuth.test.ts
describe("Google Auth", () => {
  it("should return hook with signInWithGoogle function", () => {
    // Mock expo-auth-session
  });
});
```

## Critérios de Aceitação

- [ ] Botão "Entrar com Google" funciona no app
- [ ] Usuário é autenticado no Firebase
- [ ] Perfil é sincronizado com backend (`/auth/sync`)
- [ ] Token é armazenado localmente
- [ ] Funciona em iOS, Android e Web
- [ ] Variáveis de ambiente documentadas

## Configuração Firebase Console

1. Firebase Console > Authentication > Sign-in method
2. Habilitar Google
3. Copiar Web Client ID
4. Adicionar SHA-1 do Android (para release)

## Rollback

Se não funcionar, manter o botão desabilitado com mensagem explicativa.
