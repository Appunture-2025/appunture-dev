# Prompt – Aumentar Cobertura de Testes Frontend

## Contexto

- Frontend em React Native + Expo Router
- Zustand para state management
- ~40% de cobertura atual
- Meta: 70% de cobertura

## Objetivo

Aumentar cobertura de testes Jest para 70%+ nos stores e services.

## Arquivos Prioritários

### 1. Stores (Zustand)

#### syncStore.ts (MAIOR PRIORIDADE)

- ~800 linhas de código
- Funções críticas: `syncToCloud`, `processQueueItem`, `resolveConflict`
- Atualmente: ~20% cobertura

```typescript
// __tests__/stores/syncStore.test.ts

import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useSyncStore } from "../../stores/syncStore";
import * as Network from "expo-network";
import { apiService } from "../../services/apiService";

// Mocks
jest.mock("expo-network");
jest.mock("../../services/apiService");
jest.mock("../../utils/storage");

describe("SyncStore", () => {
  beforeEach(() => {
    useSyncStore.setState({
      isOnline: true,
      isSyncing: false,
      syncQueue: [],
      conflictingItems: [],
      lastSyncTime: null,
    });
  });

  describe("Network State", () => {
    it("should update isOnline when network changes", async () => {
      (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      const { result } = renderHook(() => useSyncStore());

      await act(async () => {
        await result.current.checkNetworkStatus();
      });

      expect(result.current.isOnline).toBe(false);
    });
  });

  describe("Queue Management", () => {
    it("should add item to sync queue", async () => {
      const { result } = renderHook(() => useSyncStore());

      await act(async () => {
        await result.current.addToQueue({
          id: "1",
          type: "UPDATE",
          entity: "favorite",
          data: { pointId: "LU1" },
        });
      });

      expect(result.current.syncQueue).toHaveLength(1);
    });

    it("should process queue when online", async () => {
      (apiService.syncFavorite as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useSyncStore());

      await act(async () => {
        result.current.syncQueue = [
          {
            id: "1",
            type: "UPDATE",
            entity: "favorite",
            data: { pointId: "LU1" },
            createdAt: Date.now(),
          },
        ];
        await result.current.processQueue();
      });

      expect(result.current.syncQueue).toHaveLength(0);
    });

    it("should not process queue when offline", async () => {
      const { result } = renderHook(() => useSyncStore());

      await act(async () => {
        result.current.isOnline = false;
        result.current.syncQueue = [
          {
            id: "1",
            type: "UPDATE",
            entity: "favorite",
            data: { pointId: "LU1" },
            createdAt: Date.now(),
          },
        ];
        await result.current.processQueue();
      });

      expect(result.current.syncQueue).toHaveLength(1);
    });
  });

  describe("Conflict Resolution", () => {
    it("should mark item as conflicting when server version differs", async () => {
      (apiService.syncFavorite as jest.Mock).mockRejectedValue({
        response: { status: 409, data: { serverVersion: 2 } },
      });

      const { result } = renderHook(() => useSyncStore());

      await act(async () => {
        result.current.syncQueue = [
          {
            id: "1",
            type: "UPDATE",
            entity: "favorite",
            data: { pointId: "LU1", version: 1 },
            createdAt: Date.now(),
          },
        ];
        await result.current.processQueue();
      });

      expect(result.current.conflictingItems).toHaveLength(1);
    });

    it("should resolve conflict with client version", async () => {
      const { result } = renderHook(() => useSyncStore());

      await act(async () => {
        result.current.conflictingItems = [
          {
            id: "1",
            clientData: { pointId: "LU1" },
            serverData: { pointId: "LU2" },
          },
        ];
        await result.current.resolveConflict("1", "client");
      });

      expect(result.current.conflictingItems).toHaveLength(0);
    });
  });

  describe("Full Sync", () => {
    it("should sync all data to cloud", async () => {
      (apiService.syncAll as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useSyncStore());

      await act(async () => {
        await result.current.syncToCloud();
      });

      expect(result.current.lastSyncTime).not.toBeNull();
      expect(result.current.isSyncing).toBe(false);
    });
  });
});
```

#### pointsStore.ts

```typescript
// __tests__/stores/pointsStore.test.ts

import { renderHook, act } from "@testing-library/react-native";
import { usePointsStore } from "../../stores/pointsStore";
import { apiService } from "../../services/apiService";

jest.mock("../../services/apiService");
jest.mock("../../config/firebase", () => ({
  db: {},
  auth: { currentUser: { uid: "test-uid" } },
}));

describe("PointsStore", () => {
  beforeEach(() => {
    usePointsStore.setState({
      points: [],
      favorites: [],
      notes: {},
      loading: false,
      error: null,
    });
  });

  describe("Load Points", () => {
    it("should load points from API", async () => {
      const mockPoints = [
        { id: "LU1", name: "Zhongfu", meridian: "LU" },
        { id: "LU2", name: "Yunmen", meridian: "LU" },
      ];
      (apiService.getPoints as jest.Mock).mockResolvedValue(mockPoints);

      const { result } = renderHook(() => usePointsStore());

      await act(async () => {
        await result.current.loadPoints();
      });

      expect(result.current.points).toHaveLength(2);
      expect(result.current.loading).toBe(false);
    });

    it("should handle load error", async () => {
      (apiService.getPoints as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => usePointsStore());

      await act(async () => {
        await result.current.loadPoints();
      });

      expect(result.current.error).toBe("Network error");
    });
  });

  describe("Favorites", () => {
    it("should add point to favorites", async () => {
      (apiService.addFavorite as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => usePointsStore());

      await act(async () => {
        await result.current.addFavorite("LU1");
      });

      expect(result.current.favorites).toContain("LU1");
    });

    it("should remove point from favorites", async () => {
      (apiService.removeFavorite as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => usePointsStore());
      result.current.favorites = ["LU1", "LU2"];

      await act(async () => {
        await result.current.removeFavorite("LU1");
      });

      expect(result.current.favorites).not.toContain("LU1");
    });

    it("should toggle favorite status", async () => {
      const { result } = renderHook(() => usePointsStore());

      await act(async () => {
        await result.current.toggleFavorite("LU1");
      });

      expect(result.current.favorites).toContain("LU1");

      await act(async () => {
        await result.current.toggleFavorite("LU1");
      });

      expect(result.current.favorites).not.toContain("LU1");
    });
  });

  describe("Notes", () => {
    it("should add note to point", async () => {
      (apiService.saveNote as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => usePointsStore());

      await act(async () => {
        await result.current.addNote("LU1", "Test note content");
      });

      expect(result.current.notes["LU1"]).toBe("Test note content");
    });
  });

  describe("Search", () => {
    it("should filter points by name", () => {
      const { result } = renderHook(() => usePointsStore());
      result.current.points = [
        { id: "LU1", name: "Zhongfu", meridian: "LU" },
        { id: "LU2", name: "Yunmen", meridian: "LU" },
        { id: "ST1", name: "Chengqi", meridian: "ST" },
      ];

      const filtered = result.current.searchPoints("Zhong");

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("LU1");
    });

    it("should filter points by meridian", () => {
      const { result } = renderHook(() => usePointsStore());
      result.current.points = [
        { id: "LU1", name: "Zhongfu", meridian: "LU" },
        { id: "ST1", name: "Chengqi", meridian: "ST" },
      ];

      const filtered = result.current.getPointsByMeridian("LU");

      expect(filtered).toHaveLength(1);
    });
  });
});
```

### 2. Services

#### apiService.ts

```typescript
// __tests__/services/apiService.test.ts

import { apiService } from "../../services/apiService";
import axios from "axios";
import { auth } from "../../config/firebase";

jest.mock("axios");
jest.mock("../../config/firebase", () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue("mock-token"),
    },
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ApiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Points API", () => {
    it("should fetch all points", async () => {
      const mockData = [{ id: "LU1", name: "Zhongfu" }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiService.getPoints();

      expect(mockedAxios.get).toHaveBeenCalledWith("/points");
      expect(result).toEqual(mockData);
    });

    it("should fetch point by ID", async () => {
      const mockData = { id: "LU1", name: "Zhongfu" };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await apiService.getPointById("LU1");

      expect(mockedAxios.get).toHaveBeenCalledWith("/points/LU1");
      expect(result).toEqual(mockData);
    });
  });

  describe("Favorites API", () => {
    it("should add favorite", async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      await apiService.addFavorite("LU1");

      expect(mockedAxios.post).toHaveBeenCalledWith("/favorites", {
        pointId: "LU1",
      });
    });

    it("should remove favorite", async () => {
      mockedAxios.delete.mockResolvedValue({ data: { success: true } });

      await apiService.removeFavorite("LU1");

      expect(mockedAxios.delete).toHaveBeenCalledWith("/favorites/LU1");
    });
  });

  describe("Authentication", () => {
    it("should include auth token in requests", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      await apiService.getPoints();

      expect(mockedAxios.defaults.headers.common["Authorization"]).toBe(
        "Bearer mock-token"
      );
    });

    it("should handle expired token", async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await apiService.getPoints();

      expect(auth.currentUser?.getIdToken).toHaveBeenCalledWith(true);
    });
  });

  describe("Error Handling", () => {
    it("should throw on network error", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Network Error"));

      await expect(apiService.getPoints()).rejects.toThrow("Network Error");
    });

    it("should handle 404 response", async () => {
      mockedAxios.get.mockRejectedValue({ response: { status: 404 } });

      await expect(apiService.getPointById("INVALID")).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });
});
```

### 3. Components

#### PointCard.test.tsx

```typescript
// __tests__/components/PointCard.test.tsx

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { PointCard } from "../../components/PointCard";

describe("PointCard", () => {
  const mockPoint = {
    id: "LU1",
    name: "Zhongfu",
    chineseName: "中府",
    meridian: "LU",
    location: "On the chest...",
  };

  it("should render point information", () => {
    const { getByText } = render(
      <PointCard point={mockPoint} onPress={() => {}} />
    );

    expect(getByText("LU1")).toBeTruthy();
    expect(getByText("Zhongfu")).toBeTruthy();
    expect(getByText("中府")).toBeTruthy();
  });

  it("should call onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <PointCard point={mockPoint} onPress={onPress} testID="point-card" />
    );

    fireEvent.press(getByTestId("point-card"));

    expect(onPress).toHaveBeenCalledWith(mockPoint);
  });

  it("should show favorite icon when favorited", () => {
    const { getByTestId } = render(
      <PointCard point={mockPoint} onPress={() => {}} isFavorite={true} />
    );

    expect(getByTestId("favorite-icon")).toBeTruthy();
  });
});
```

## Configuração Jest

Atualizar `jest.config.js`:

```javascript
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  collectCoverageFrom: [
    "stores/**/*.{ts,tsx}",
    "services/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "utils/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
};
```

## Comandos

```bash
# Rodar testes com cobertura
cd frontend-mobile/appunture
npm test -- --coverage

# Rodar testes de um arquivo específico
npm test -- stores/syncStore.test.ts

# Watch mode
npm test -- --watch
```

## Critérios de Aceitação

- [ ] Cobertura total >= 70%
- [ ] syncStore.ts com >= 75% de cobertura
- [ ] pointsStore.ts com >= 80% de cobertura
- [ ] apiService.ts com >= 80% de cobertura
- [ ] Todos os testes passando
- [ ] Sem mocks vazios ou skipped tests

## Prioridade de Arquivos

1. **CRÍTICO**: `syncStore.ts` - sync offline/online
2. **ALTO**: `pointsStore.ts` - dados principais
3. **ALTO**: `apiService.ts` - comunicação com backend
4. **MÉDIO**: `authStore.ts` - já tem boa cobertura
5. **MÉDIO**: Components
