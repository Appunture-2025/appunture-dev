import { create } from "zustand";
import type { Point, PointWithSymptoms } from "../types/api";
import type { LocalPoint } from "../types/database";
import { apiService } from "../services/api";
import { databaseService } from "../services/database";
import { buildPointGallerySources } from "../utils/pointMedia";
import { useAuthStore } from "./authStore";
import { useSyncStore } from "./syncStore";

const LOCAL_USER_ID = "local";

const parseCoordinates = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const withGalleryMedia = <T extends Point>(point: T): T => {
  const gallerySources = buildPointGallerySources(point);
  return {
    ...point,
    gallerySources,
    primaryGalleryImage: gallerySources[0] ?? null,
  } as T;
};

const mapLocalPointToPoint = (
  local: LocalPoint,
  isFavorite: boolean
): Point => {
  const coordinates = parseCoordinates(local.coordinates);
  const imageUrl = local.image_path ?? undefined;

  return withGalleryMedia({
    id: local.id,
    code: local.code ?? "",
    name: local.name,
    chinese_name: local.chinese_name,
    chineseName: local.chinese_name,
    meridian: local.meridian,
    location: local.location,
    indications: local.indications ?? undefined,
    contraindications: local.contraindications ?? undefined,
    coordinates,
    image_url: imageUrl,
    imageUrls: imageUrl ? [imageUrl] : undefined,
    favoriteCount: local.favorite_count ?? undefined,
    isFavorite,
  });
};

const getCurrentUserId = (): string => {
  const user = useAuthStore.getState().user;
  if (!user || user.id === undefined || user.id === null) {
    return LOCAL_USER_ID;
  }
  return String(user.id);
};

const getActiveFavoriteIds = async (userId: string): Promise<Set<string>> => {
  try {
    const favorites = await databaseService.getFavorites(userId);
    return new Set(
      favorites
        .filter((favorite) => favorite.operation !== "DELETE")
        .map((favorite) => favorite.point_id)
    );
  } catch (error) {
    console.warn("Failed to load favorite ids:", error);
    return new Set<string>();
  }
};

const applyFavoriteFlags = (
  points: Point[],
  favoriteIds: Set<string>
): Point[] =>
  points.map((point) => {
    const normalized = withGalleryMedia(point);
    return {
      ...normalized,
      isFavorite: favoriteIds.has(point.id) || Boolean(normalized.isFavorite),
    };
  });

const loadLocalFavorites = async (userId: string): Promise<Point[]> => {
  try {
    const favorites = await databaseService.getFavorites(userId);
    const activeFavorites = favorites.filter(
      (favorite) => favorite.operation !== "DELETE"
    );

    const points: Point[] = [];
    for (const favorite of activeFavorites) {
      const localPoint = await databaseService.getPointById(favorite.point_id);
      if (localPoint) {
        points.push(mapLocalPointToPoint(localPoint, true));
      }
    }

    return points;
  } catch (error) {
    console.error("Failed to load local favorites:", error);
    return [];
  }
};

interface PointsState {
  points: Point[];
  favorites: Point[];
  favoritesPage: number;
  favoritesHasMore: boolean;
  selectedPoint: PointWithSymptoms | null;
  searchResults: Point[];
  meridians: Array<{ meridian: string; point_count: number }>;
  loading: boolean;
  error: string | null;
  loadPoints: (params?: {
    limit?: number;
    offset?: number;
    meridian?: string;
  }) => Promise<void>;
  loadPoint: (id: string) => Promise<void>;
  searchPoints: (query: string) => Promise<void>;
  searchPointByCode: (code: string) => Promise<void>;
  loadPointsByMeridian: (meridian: string) => Promise<void>;
  loadPopularPoints: (limit?: number) => Promise<void>;
  loadMeridians: () => Promise<void>;
  loadFavorites: (loadMore?: boolean) => Promise<void>;
  toggleFavorite: (pointId: string) => Promise<void>;
  clearSearch: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  getLocalPoints: () => Promise<void>;
  getLocalPoint: (id: string) => Promise<void>;
  syncPoints: () => Promise<void>;
}

export const usePointsStore = create<PointsState>((set, get) => {
  const applyFavoritesToState = (favoritePoints: Point[]) => {
    const normalizedFavorites = favoritePoints
      .map(withGalleryMedia)
      .map((point) => ({ ...point, isFavorite: true }));
    const favoriteIds = new Set(normalizedFavorites.map((point) => point.id));
    set((state) => ({
      favorites: normalizedFavorites,
      points: applyFavoriteFlags(state.points, favoriteIds),
      searchResults: applyFavoriteFlags(state.searchResults, favoriteIds),
      loading: false,
      error: null,
    }));
  };

  const updateCollectionsForFavorite = (point: Point, isFavorite: boolean) => {
    set((state) => {
      const updateList = (list: Point[]) =>
        list.map((item) =>
          item.id === point.id ? { ...item, isFavorite } : item
        );

      const filteredFavorites = state.favorites.filter(
        (favorite) => favorite.id !== point.id
      );

      return {
        favorites: isFavorite
          ? [{ ...point, isFavorite: true }, ...filteredFavorites]
          : filteredFavorites,
        points: updateList(state.points),
        searchResults: updateList(state.searchResults),
        error: null,
      };
    });
  };

  const revertCollectionsForFavorite = (
    pointId: string,
    snapshot: Point,
    shouldBeFavorite: boolean
  ) => {
    set((state) => {
      const updateList = (list: Point[]) =>
        list.map((item) =>
          item.id === pointId ? { ...item, isFavorite: shouldBeFavorite } : item
        );

      const filteredFavorites = state.favorites.filter(
        (favorite) => favorite.id !== pointId
      );

      return {
        favorites: shouldBeFavorite
          ? [{ ...snapshot, isFavorite: true }, ...filteredFavorites]
          : filteredFavorites,
        points: updateList(state.points),
        searchResults: updateList(state.searchResults),
        error: "Não foi possível sincronizar. Verifique sua conexão.",
      };
    });
  };

  return {
    points: [],
    favorites: [],
    favoritesPage: 0,
    favoritesHasMore: true,
    selectedPoint: null,
    searchResults: [],
    meridians: [],
    loading: false,
    error: null,

    loadPoints: async (params) => {
      set({ loading: true, error: null });
      const userId = getCurrentUserId();

      try {
        const response = await apiService.getPoints(params);
        const favoriteIds = await getActiveFavoriteIds(userId);
        set({
          points: applyFavoriteFlags(response.points, favoriteIds),
          loading: false,
        });
      } catch (error: any) {
        console.error("Load points error:", error);

        try {
          await get().getLocalPoints();
        } catch {
          const message =
            error instanceof Error ? error.message : "Failed to load points";
          set({
            error: message,
            loading: false,
          });
        }
      }
    },

    loadPoint: async (id: string) => {
      set({ loading: true, error: null });
      const userId = getCurrentUserId();

      try {
        const response = await apiService.getPoint(id);
        const normalizedPoint = withGalleryMedia(response.point);
        let isFavorite = Boolean(normalizedPoint.isFavorite);

        if (!isFavorite) {
          try {
            isFavorite = await databaseService.isFavorite(id, userId);
          } catch {
            // Ignore local lookup failure, keep API value
          }
        }

        set({
          selectedPoint: {
            ...normalizedPoint,
            isFavorite,
          },
          loading: false,
        });
      } catch (error: any) {
        console.error("Load point error:", error);

        try {
          await get().getLocalPoint(id);
        } catch {
          const message =
            error instanceof Error ? error.message : "Failed to load point";
          set({
            error: message,
            loading: false,
          });
        }
      }
    },

    searchPoints: async (query: string) => {
      set({ loading: true, error: null });
      const userId = getCurrentUserId();

      try {
        const response = await apiService.searchPoints(query);
        const favoriteIds = await getActiveFavoriteIds(userId);

        set({
          searchResults: applyFavoriteFlags(response.points, favoriteIds),
          loading: false,
        });
      } catch (error) {
        console.error("Search points error:", error);
        const message =
          error instanceof Error ? error.message : "Failed to search points";
        set({
          error: message,
          loading: false,
        });
      }
    },

    searchPointByCode: async (code: string) => {
      set({ loading: true, error: null });
      const userId = getCurrentUserId();

      try {
        const response = await apiService.getPointByCode(code);
        const normalizedPoint = withGalleryMedia(response.point);
        let isFavorite = Boolean(normalizedPoint.isFavorite);

        if (!isFavorite) {
          try {
            isFavorite = await databaseService.isFavorite(
              normalizedPoint.id,
              userId
            );
          } catch {
            // Ignore lookup failure
          }
        }

        set({
          selectedPoint: {
            ...normalizedPoint,
            isFavorite,
          },
          loading: false,
        });
      } catch (error) {
        console.error("Search point by code error:", error);
        const message =
          error instanceof Error ? error.message : "Failed to find point";
        set({
          error: message,
          loading: false,
        });
      }
    },

    loadPointsByMeridian: async (meridian: string) => {
      set({ loading: true, error: null });
      const userId = getCurrentUserId();

      try {
        const response = await apiService.getPointsByMeridian(meridian);
        const favoriteIds = await getActiveFavoriteIds(userId);

        set({
          points: applyFavoriteFlags(response.points, favoriteIds),
          loading: false,
        });
      } catch (error) {
        console.error("Load points by meridian error:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load points by meridian";
        set({
          error: message,
          loading: false,
        });
      }
    },

    loadPopularPoints: async (limit = 10) => {
      set({ loading: true, error: null });
      const userId = getCurrentUserId();

      try {
        const response = await apiService.getPopularPoints(limit);
        const favoriteIds = await getActiveFavoriteIds(userId);

        set({
          points: applyFavoriteFlags(response.points, favoriteIds),
          loading: false,
        });
      } catch (error) {
        console.error("Load popular points error:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load popular points";
        set({
          error: message,
          loading: false,
        });
      }
    },

    loadMeridians: async () => {
      set({ loading: true, error: null });

      try {
        const response = await apiService.getMeridians();

        set({
          meridians: response.meridians,
          loading: false,
        });
      } catch (error) {
        console.error("Load meridians error:", error);
        const message =
          error instanceof Error ? error.message : "Failed to load meridians";
        set({
          error: message,
          loading: false,
        });
      }
    },

    loadFavorites: async (loadMore = false) => {
      const state = get();
      if (state.loading) return;

      const page = loadMore ? state.favoritesPage + 1 : 0;
      set({ loading: true, error: null });

      const { user } = useAuthStore.getState();
      const hasAuthenticatedUser = Boolean(
        user && user.id !== undefined && user.id !== null
      );
      const userId = hasAuthenticatedUser ? String(user!.id) : LOCAL_USER_ID;

      if (!hasAuthenticatedUser) {
        const localFavorites = await loadLocalFavorites(userId);
        applyFavoritesToState(localFavorites);
        set({ favoritesHasMore: false });
        return;
      }

      try {
        const response = await apiService.getFavorites(page, 10);
        const favoritesWithFlag = response.points.map((point) =>
          withGalleryMedia({
            ...point,
            isFavorite: true,
          })
        );

        if (page === 0) {
          await databaseService.replaceFavorites(
            userId,
            favoritesWithFlag.map((point) => point.id)
          );
          await databaseService
            .updateSyncStatus("favorites", "success")
            .catch(() => undefined);
        }

        set((state) => ({
          favorites: loadMore
            ? [...state.favorites, ...favoritesWithFlag]
            : favoritesWithFlag,
          favoritesPage: page,
          favoritesHasMore: response.hasMore,
          loading: false,
          error: null,
        }));

        const favoriteIds = new Set(favoritesWithFlag.map((point) => point.id));
        set((state) => ({
          points: applyFavoriteFlags(state.points, favoriteIds),
          searchResults: applyFavoriteFlags(state.searchResults, favoriteIds),
        }));
      } catch (error) {
        console.warn(
          "Failed to load favorites from API, using local cache:",
          error
        );

        if (!loadMore) {
          const localFavorites = await loadLocalFavorites(userId);
          if (localFavorites.length === 0) {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to load favorites";
            set({
              favorites: [],
              loading: false,
              error: message,
            });
          } else {
            applyFavoritesToState(localFavorites);
          }
        } else {
          set({ loading: false });
        }
      }
    },

    toggleFavorite: async (pointId: string) => {
      const state = get();
      const isCurrentlyFavorite = state.favorites.some(
        (favorite) => favorite.id === pointId
      );
      const shouldFavorite = !isCurrentlyFavorite;

      let point =
        state.points.find((item) => item.id === pointId) ??
        state.searchResults.find((item) => item.id === pointId) ??
        state.favorites.find((item) => item.id === pointId);

      if (!point && shouldFavorite) {
        const localPoint = await databaseService.getPointById(pointId);
        if (localPoint) {
          point = mapLocalPointToPoint(localPoint, true);
        }
      }

      if (!point) {
        throw new Error("Point not found");
      }

      const originalSnapshot: Point = {
        ...point,
        isFavorite: isCurrentlyFavorite,
      };
      const updatedPoint: Point = { ...point, isFavorite: shouldFavorite };

      updateCollectionsForFavorite(updatedPoint, shouldFavorite);

      try {
        const { user } = useAuthStore.getState();
        const hasAuthenticatedUser = Boolean(
          user && user.id !== undefined && user.id !== null
        );
        const userId = hasAuthenticatedUser ? String(user!.id) : LOCAL_USER_ID;

        if (!hasAuthenticatedUser) {
          await databaseService.setFavoriteStatus({
            pointId,
            userId,
            isFavorite: shouldFavorite,
            synced: true,
          });
          return;
        }

        await databaseService.setFavoriteStatus({
          pointId,
          userId,
          isFavorite: shouldFavorite,
          synced: false,
        });

        await databaseService.enqueueFavoriteOperation(
          userId,
          pointId,
          shouldFavorite ? "ADD" : "REMOVE"
        );

        const syncStore = useSyncStore.getState();
        if (syncStore.isOnline) {
          await syncStore.processSyncQueue();
        } else {
          await syncStore.refreshPendingOperations();
        }
      } catch (error) {
        console.error("Toggle favorite error:", error);
        revertCollectionsForFavorite(
          pointId,
          originalSnapshot,
          isCurrentlyFavorite
        );
        throw new Error("Não foi possível sincronizar. Verifique sua conexão.");
      }
    },

    clearSearch: () => {
      set({ searchResults: [] });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    setLoading: (loading: boolean) => {
      set({ loading });
    },

    getLocalPoints: async () => {
      const userId = getCurrentUserId();

      try {
        const [localPoints, favoriteIds] = await Promise.all([
          databaseService.getPoints(),
          getActiveFavoriteIds(userId),
        ]);

        const points = localPoints.map((point) =>
          mapLocalPointToPoint(point, favoriteIds.has(point.id))
        );

        set({
          points,
          loading: false,
        });
      } catch (error) {
        console.error("Get local points error:", error);
        set({ loading: false });
        throw error;
      }
    },

    getLocalPoint: async (id: string) => {
      const userId = getCurrentUserId();

      try {
        const [localPoint, favoriteIds] = await Promise.all([
          databaseService.getPointById(id),
          getActiveFavoriteIds(userId),
        ]);

        if (!localPoint) {
          throw new Error("Point not found locally");
        }

        const point = mapLocalPointToPoint(localPoint, favoriteIds.has(id));
        const pointWithSymptoms: PointWithSymptoms = {
          ...point,
          symptoms: [],
        };

        set({
          selectedPoint: pointWithSymptoms,
          loading: false,
        });
      } catch (error) {
        console.error("Get local point error:", error);
        set({ loading: false });
        throw error;
      }
    },

    syncPoints: async () => {
      const syncStore = useSyncStore.getState();
      set({ loading: true, error: null });

      try {
        await syncStore.syncPoints();
        await get().getLocalPoints();
      } catch (error) {
        console.error("Sync points error:", error);
        const message =
          error instanceof Error ? error.message : "Failed to sync points";
        set({
          error: message,
          loading: false,
        });
      }
    },
  };
});
