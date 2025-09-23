# Exemplo Frontend React Native - Firebase Storage

## Instalação

```bash
# Instalar dependências Firebase
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/storage

# Para React Native >= 0.60, rodar:
cd ios && pod install
```

## Configuração

### 1. arquivo `firebase.json`
```json
{
  "react-native": {
    "android_task_type": "async",
    "ios_use_frameworks": false
  }
}
```

### 2. Componente de Upload

```javascript
// components/ImageUploader.jsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

export const ImageUploader = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const selectAndUploadImage = async () => {
    // 1. Selecionar imagem
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      async (response) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          await uploadImage(asset.uri, asset.fileName);
        }
      }
    );
  };

  const uploadImage = async (uri, fileName) => {
    if (!auth().currentUser) {
      Alert.alert('Erro', 'Usuário não está logado');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 2. Criar referência no Firebase Storage
      const userId = auth().currentUser.uid;
      const storageRef = storage().ref(`users/${userId}/${Date.now()}_${fileName}`);

      // 3. Configurar upload task
      const uploadTask = storageRef.putFile(uri);

      // 4. Acompanhar progresso
      uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
        console.log(`Upload ${progress}% concluído`);
      });

      // 5. Aguardar conclusão
      await uploadTask;

      // 6. Obter URL de download
      const downloadURL = await storageRef.getDownloadURL();

      // 7. Salvar referência no backend
      await saveImageToBackend(downloadURL, fileName);

      Alert.alert('Sucesso', 'Imagem enviada com sucesso!');
      onUploadComplete?.(downloadURL);

    } catch (error) {
      console.error('Erro no upload:', error);
      Alert.alert('Erro', 'Falha no upload: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const saveImageToBackend = async (imageUrl, fileName) => {
    const token = await auth().currentUser.getIdToken();
    
    const response = await fetch('https://seu-backend.com/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        imageUrl,
        fileName,
        uploadedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao salvar no backend');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity
        onPress={selectAndUploadImage}
        disabled={uploading}
        style={{
          backgroundColor: uploading ? '#ccc' : '#007bff',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>
          {uploading ? `Enviando... ${uploadProgress}%` : 'Selecionar e Enviar Imagem'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 3. Hook para Gerenciar Uploads

```javascript
// hooks/useFirebaseStorage.js
import { useState, useEffect } from 'react';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

export const useFirebaseStorage = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);

  // Upload com retry automático
  const uploadWithRetry = async (uri, path, maxRetries = 3) => {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const reference = storage().ref(path);
        const uploadTask = reference.putFile(uri);
        
        await uploadTask;
        const downloadURL = await reference.getDownloadURL();
        
        return downloadURL;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw error;
        }
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  // Sincronizar uploads pendentes (offline-first)
  const syncPendingUploads = async () => {
    const pendingUploads = uploads.filter(upload => upload.status === 'pending');
    
    for (const upload of pendingUploads) {
      try {
        const downloadURL = await uploadWithRetry(upload.localUri, upload.path);
        
        // Atualizar status local
        setUploads(prev => prev.map(u => 
          u.id === upload.id 
            ? { ...u, status: 'completed', downloadURL }
            : u
        ));
        
        // Salvar no backend
        await saveToBackend(upload.id, downloadURL);
        
      } catch (error) {
        console.error('Erro na sincronização:', error);
        setUploads(prev => prev.map(u => 
          u.id === upload.id 
            ? { ...u, status: 'error', error: error.message }
            : u
        ));
      }
    }
  };

  // Cache e offline support
  const downloadAndCache = async (url, fileName) => {
    try {
      const reference = storage().refFromURL(url);
      const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      
      await reference.writeToFile(localPath);
      return localPath;
    } catch (error) {
      console.error('Erro no cache:', error);
      return null;
    }
  };

  return {
    uploads,
    loading,
    uploadWithRetry,
    syncPendingUploads,
    downloadAndCache,
  };
};
```

### 4. Configuração de Regras de Segurança

No Firebase Console, configurar as regras:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Pasta do usuário - apenas o próprio usuário pode acessar
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Pasta pública - todos podem ler, apenas autenticados podem escrever
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Pasta geral - apenas usuários autenticados
    match /general/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Validações de arquivo
    match /{allPaths=**} {
      allow write: if request.resource.size < 10 * 1024 * 1024 // 10MB
                   && request.resource.contentType.matches('image/.*|application/pdf');
    }
  }
}
```

## Vantagens do Firebase Storage para TCC

### ✅ **Offline-First**
- Cache automático de imagens
- Upload em background
- Retry automático quando conexão voltar

### ✅ **Performance**
- CDN global do Google
- Compressão automática
- Cache inteligente

### ✅ **Segurança**
- Regras declarativas
- Integração com Firebase Auth
- URLs assinadas para acesso temporário

### ✅ **Desenvolvimento**
- SDKs nativos otimizados
- Progress tracking
- Error handling robusto

### ✅ **Custo Zero**
- 5GB gratuitos
- 1GB tráfego/dia
- 20k operações/dia

Perfeito para TCC! 🎯