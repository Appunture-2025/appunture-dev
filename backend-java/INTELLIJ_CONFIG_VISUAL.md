# 🎯 Como Configurar IntelliJ - Passo a Passo com Imagens

## Método 1: Não Precisa de Variável de Ambiente! ✅

Acabei de corrigir o código. Agora basta **recompilar e rodar de novo**:

1. **Build → Rebuild Project** (ou Ctrl+Shift+F9)
2. **Run → Run 'BackendApplication'** (ou Shift+F10)

O código agora lê automaticamente o `serviceAccount.json` da raiz do projeto (`../serviceAccount.json` relativo ao backend).

**Aguarde ver nos logs:**

```
✅ Using credentials from firebase.service-account-key-path: ../serviceAccount.json
✅ Firebase initialized successfully
✅ Started BackendApplication
```

---

## Método 2: Configurar Variável de Ambiente (Opcional)

Se quiser usar caminho absoluto ao invés de relativo:

### Passo 1: Abrir Edit Configurations

**Opção A - Menu:**

```
Run → Edit Configurations...
```

**Opção B - Toolbar:**

1. Procure no canto superior direito
2. Clique na dropdown ao lado do botão ▶️ Run
3. Selecione "Edit Configurations..."

### Passo 2: Selecionar a Configuration

Na janela que abrir:

1. Lado esquerdo: Procure por **"Spring Boot"** ou **"BackendApplication"**
2. Clique nela para selecionar

### Passo 3: Adicionar Environment Variables

1. Na aba principal, procure o campo **"Environment variables:"**
2. Clique no ícone de pasta 📁 ou no botão [...] ao lado
3. Uma nova janela "Environment Variables" abre

### Passo 4: Adicionar a Variável

Na janela "Environment Variables":

1. Clique no botão **"+"** (Add)
2. **Name:** `SERVICE_ACCOUNT_PATH`
3. **Value:** `D:\_repos\appunture-dev\serviceAccount.json`
4. Clique **OK**

### Passo 5: Salvar

1. Clique **OK** para fechar "Environment Variables"
2. Clique **Apply** na janela "Run/Debug Configurations"
3. Clique **OK** para fechar

### Passo 6: Rodar

1. Clique no botão ▶️ **Run**
2. Ou pressione **Shift+F10**

---

## Layout Visual da Configuração

```
┌─────────────────────────────────────────────────┐
│ Run/Debug Configurations                         │
├─────────────────────────────────────────────────┤
│                                                   │
│ ├─ Spring Boot                                   │
│ │  └─ BackendApplication      [Selected]        │
│                                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ Name: BackendApplication                     │ │
│ │                                              │ │
│ │ Main class:                                  │ │
│ │ com.appunture.backend.BackendApplication     │ │
│ │                                              │ │
│ │ Active profiles:                             │ │
│ │ dev                                          │ │
│ │                                              │ │
│ │ Environment variables:                       │ │
│ │ SERVICE_ACCOUNT_PATH=D:\_repos\...   [...]  │ │
│ │                          👆 Clique aqui      │ │
│ │                                              │ │
│ │ Working directory:                           │ │
│ │ D:\_repos\appunture-dev\backend-java        │ │
│ └─────────────────────────────────────────────┘ │
│                                                   │
│                          [Apply]  [OK]  [Cancel] │
└─────────────────────────────────────────────────┘
```

---

## Environment Variables Window

Quando clicar no [...] ao lado de "Environment variables:":

```
┌──────────────────────────────────────────┐
│ Environment Variables                     │
├──────────────────────────────────────────┤
│                                           │
│  [+]  [-]  [↑]  [↓]                      │
│   👆 Clique para adicionar               │
│                                           │
│ ┌────────────────────────────────────┐   │
│ │ Name                    │ Value    │   │
│ ├────────────────────────────────────┤   │
│ │ SERVICE_ACCOUNT_PATH    │ D:\...   │   │
│ └────────────────────────────────────┘   │
│                                           │
│                    [OK]  [Cancel]         │
└──────────────────────────────────────────┘
```

---

## Verificação Final

Após rodar, os logs devem mostrar:

```log
✅ Using credentials from firebase.service-account-key-path: ../serviceAccount.json
✅ Firebase initialized successfully for project: appunture-tcc
✅ Firebase Storage initialized successfully
✅ Firebase Auth initialized
✅ ChatClient created successfully
✅ Started BackendApplication in 3.456 seconds
✅ Tomcat started on port(s): 8080 (http)
```

### ❌ Se ainda der erro:

**Erro: "service account file not found"**

```powershell
# Verificar se arquivo existe
Test-Path D:\_repos\appunture-dev\serviceAccount.json

# Se não existir, verificar onde está
Get-ChildItem D:\_repos\appunture-dev -Filter "serviceAccount.json" -Recurse
```

**Erro: "Your default credentials were not found"**

- O caminho relativo `../serviceAccount.json` está errado
- Use variável de ambiente com caminho absoluto
- Ou mova o arquivo para `backend-java/serviceAccount.json`

---

## Atalhos Úteis

| Ação                | Atalho                  |
| ------------------- | ----------------------- |
| Edit Configurations | Alt+Shift+F10, 0        |
| Run                 | Shift+F10               |
| Stop                | Ctrl+F2                 |
| Rebuild Project     | Ctrl+Shift+F9           |
| View Logs           | Alt+4 (Run tool window) |

---

## 🎯 Pronto!

1. ✅ Código corrigido para ler `service-account-key-path`
2. ✅ YAML configurado com caminho relativo `../serviceAccount.json`
3. ✅ Agora basta **Rebuild + Run**

**Não precisa de variável de ambiente!** O código busca automaticamente na raiz do projeto.
