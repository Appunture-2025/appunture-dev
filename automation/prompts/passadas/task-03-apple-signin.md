# Prompt – Implementar Apple Sign-In (iOS)

## Contexto

- `authStore.ts` tem placeholder para `loginWithApple` que lança erro
- Obrigatório para apps iOS que oferecem login social (App Store Review Guidelines)
- Disponível apenas em dispositivos Apple

## Objetivo

Implementar autenticação com Apple ID no frontend mobile usando Firebase Auth + Expo.

## Dependências

```bash
cd frontend-mobile/appunture
npx expo install expo-apple-authentication
```

## Implementação

### 1. Criar serviço Apple Auth

Criar `frontend-mobile/appunture/services/appleAuth.ts`:

```typescript
import * as AppleAuthentication from "expo-apple-authentication";
import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { firebaseAuth } from "./firebase";
import { Platform } from "react-native";

export const isAppleAuthAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== "ios") return false;
  return await AppleAuthentication.isAvailableAsync();
};

export const signInWithApple = async () => {
  if (Platform.OS !== "ios") {
    throw new Error("Apple Sign-In disponível apenas em iOS");
  }

  const isAvailable = await AppleAuthentication.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Apple Sign-In não disponível neste dispositivo");
  }

  // Solicitar credenciais da Apple
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error("Não foi possível obter token de identidade da Apple");
  }

  // Criar credencial Firebase
  const provider = new OAuthProvider("apple.com");
  const oauthCredential = provider.credential({
    idToken: credential.identityToken,
    rawNonce: credential.authorizationCode ?? undefined,
  });

  // Autenticar no Firebase
  const userCredential = await signInWithCredential(
    firebaseAuth,
    oauthCredential
  );

  // Atualizar nome se disponível (Apple só envia na primeira vez)
  if (credential.fullName?.givenName || credential.fullName?.familyName) {
    const displayName = [
      credential.fullName.givenName,
      credential.fullName.familyName,
    ]
      .filter(Boolean)
      .join(" ");

    // Salvar localmente para uso futuro
    return { userCredential, displayName };
  }

  return { userCredential, displayName: null };
};
```

### 2. Atualizar authStore.ts

```typescript
// Importar
import { signInWithApple, isAppleAuthAvailable } from '../services/appleAuth';

// Substituir loginWithApple:
loginWithApple: async () => {
  try {
    set({ isLoading: true });

    const { userCredential, displayName } = await signInWithApple();

    const idToken = await userCredential.user.getIdToken(true);
    await storeToken(idToken);

    let profile: User | null = null;
    try {
      profile = await apiService.getProfile();
    } catch {
      profile = await apiService.syncFirebaseUser();
    }

    // Se temos displayName da Apple e perfil não tem nome
    if (displayName && (!profile.name || profile.name === 'Usuário')) {
      profile = await apiService.updateProfile({ name: displayName });
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

```tsx
// frontend-mobile/appunture/app/login.tsx
import { Platform } from 'react-native';
import { isAppleAuthAvailable } from '../services/appleAuth';

export default function LoginScreen() {
  const [appleAvailable, setAppleAvailable] = useState(false);
  const { loginWithApple, isLoading } = useAuthStore();

  useEffect(() => {
    isAppleAuthAvailable().then(setAppleAvailable);
  }, []);

  const handleAppleSignIn = async () => {
    try {
      await loginWithApple();
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert('Erro', error.message);
      }
    }
  };

  return (
    // ... existing code ...

    {/* Botão Apple - apenas iOS */}
    {Platform.OS === 'ios' && appleAvailable && (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={8}
        style={styles.appleButton}
        onPress={handleAppleSignIn}
      />
    )}
  );
}
```

### 4. Configurar app.json

```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true,
      "bundleIdentifier": "com.appunture.app"
    }
  }
}
```

### 5. Criar teste

```typescript
// __tests__/services/appleAuth.test.ts
import { isAppleAuthAvailable } from "../../services/appleAuth";
import { Platform } from "react-native";

jest.mock("expo-apple-authentication");

describe("Apple Auth", () => {
  it("should return false on non-iOS platforms", async () => {
    Platform.OS = "android";
    const available = await isAppleAuthAvailable();
    expect(available).toBe(false);
  });

  it("should check availability on iOS", async () => {
    Platform.OS = "ios";
    // Mock AppleAuthentication.isAvailableAsync
  });
});
```

## Critérios de Aceitação

- [ ] Botão Apple aparece apenas em iOS
- [ ] Autenticação funciona em dispositivos reais
- [ ] Nome é extraído corretamente (quando disponível)
- [ ] Perfil sincronizado com backend
- [ ] Erro tratado se usuário cancelar
- [ ] `usesAppleSignIn: true` em app.json

## Configuração Firebase Console

1. Firebase Console > Authentication > Sign-in method
2. Habilitar Apple
3. Configurar Service ID e Team ID (do Apple Developer)
4. Adicionar domínio de callback

## Configuração Apple Developer

1. Certificates, Identifiers & Profiles
2. Identifiers > App IDs > Selecionar app
3. Habilitar "Sign In with Apple"
4. Criar Service ID para web (se necessário)

## Rollback

Se não funcionar, ocultar botão em vez de mostrar erro.
