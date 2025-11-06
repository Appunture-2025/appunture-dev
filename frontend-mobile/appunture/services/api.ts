import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders,
} from "axios";
import {
  Point,
  Symptom,
  Note,
  User,
  LoginResponse,
  RegisterResponse,
  PointsResponse,
  SymptomsResponse,
  SearchResponse,
  MeridiansResponse,
  CategoriesResponse,
  PointWithSymptoms,
  SymptomWithPoints,
  LoginCredentials,
  RegisterData,
  UserProfile,
  ApiError,
} from "../types/api";
import { API_BASE_URL } from "../utils/constants";
import { getStoredToken } from "./storage";
import { firebaseAuth } from "./firebase";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const currentUser = firebaseAuth.currentUser;
        let token: string | null = null;

        if (currentUser) {
          try {
            token = await currentUser.getIdToken();
          } catch (error) {
            console.warn("Failed to retrieve Firebase ID token", error);
          }
        }

        if (!token) {
          token = await getStoredToken();
        }

        if (token) {
          config.headers = config.headers ?? new AxiosHeaders();
          if (config.headers instanceof AxiosHeaders) {
            config.headers.set("Authorization", `Bearer ${token}`);
          } else {
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          error: "Network Error",
          message: "Failed to connect to server",
        };

        if (error.response) {
          // Server responded with error status
          const responseData = error.response.data as any;
          apiError.error = responseData?.error || "Server Error";
          apiError.message = responseData?.message || error.message;
          apiError.status = error.response.status;
        } else if (error.request) {
          // Request was made but no response received
          apiError.error = "Network Error";
          apiError.message = "No response from server";
          apiError.status = undefined;
        } else {
          // Something else happened
          apiError.error = "Request Error";
          apiError.message = error.message;
          apiError.status = undefined;
        }

        return Promise.reject(apiError);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    const response = await this.client.post<RegisterResponse>(
      "/auth/register",
      userData
    );
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get<{ user?: User } | User>(
      "/auth/profile"
    );
    const payload = response.data as { user?: User } | User;
    return ("user" in payload && payload.user ? payload.user : payload) as User;
  }

  async updateProfile(userData: UserProfile): Promise<User> {
    const response = await this.client.put<{ user?: User } | User>(
      "/auth/profile",
      userData
    );
    const payload = response.data as { user?: User } | User;
    return ("user" in payload && payload.user ? payload.user : payload) as User;
  }

  async syncFirebaseUser(): Promise<User> {
    const response = await this.client.post<{ user?: User } | User>(
      "/auth/sync"
    );
    const payload = response.data as { user?: User } | User;
    return ("user" in payload && payload.user ? payload.user : payload) as User;
  }

  async uploadFile(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string }> {
    const response = await this.client.post<{ url: string }>(
      "/storage/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }

          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress?.(percentCompleted);
        },
      }
    );

    return response.data;
  }

  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      "/auth/resend-verification"
    );
    return response.data;
  }

  // Points endpoints
  async getPoints(params?: {
    limit?: number;
    offset?: number;
    meridian?: string;
  }): Promise<PointsResponse> {
    const response = await this.client.get<PointsResponse>("/points", {
      params,
    });
    return response.data;
  }

  async getPoint(id: string): Promise<{ point: PointWithSymptoms }> {
    const response = await this.client.get<{ point: PointWithSymptoms }>(
      `/points/${id}`
    );
    return response.data;
  }

  async searchPoints(query: string): Promise<SearchResponse> {
    const response = await this.client.get<SearchResponse>("/points/search", {
      params: { name: query }, // Backend uses 'name' parameter
    });
    return response.data;
  }

  async getPointsBySymptom(symptomId: string): Promise<PointsResponse> {
    const response = await this.client.get<PointsResponse>(
      `/points/symptom/${symptomId}`
    );
    return response.data;
  }

  async getPointByCode(code: string): Promise<{ point: PointWithSymptoms }> {
    const response = await this.client.get<{ point: PointWithSymptoms }>(
      `/points/code/${code}`
    );
    return response.data;
  }

  async getPointsByMeridian(meridian: string): Promise<PointsResponse> {
    const response = await this.client.get<PointsResponse>(
      `/points/meridian/${meridian}`
    );
    return response.data;
  }

  async getPopularPoints(limit: number = 10): Promise<PointsResponse> {
    const response = await this.client.get<PointsResponse>("/points/popular", {
      params: { limit },
    });
    return response.data;
  }

  async getMeridians(): Promise<MeridiansResponse> {
    // Backend doesn't have /points/meridians endpoint
    // We need to get distinct meridians from points
    const response = await this.client.get<PointsResponse>("/points");
    const meridians = Array.from(
      new Set(response.data.points.map((p) => p.meridian))
    ).map((meridian) => ({
      meridian,
      point_count: response.data.points.filter((p) => p.meridian === meridian)
        .length,
    }));
    return { meridians };
  }

  // Symptoms endpoints
  async getSymptoms(params?: { category?: string }): Promise<SymptomsResponse> {
    const response = await this.client.get<SymptomsResponse>("/symptoms", {
      params,
    });
    return response.data;
  }

  async getSymptom(id: string): Promise<{ symptom: SymptomWithPoints }> {
    const response = await this.client.get<{ symptom: SymptomWithPoints }>(
      `/symptoms/${id}`
    );
    return response.data;
  }

  async searchSymptoms(query: string): Promise<SymptomsResponse> {
    const response = await this.client.get<SymptomsResponse>(
      "/symptoms/search",
      {
        params: { name: query }, // Backend uses 'name' parameter
      }
    );
    return response.data;
  }

  async getSymptomCategories(): Promise<CategoriesResponse> {
    const response = await this.client.get<CategoriesResponse>(
      "/symptoms/categories"
    );
    return response.data;
  }

  async getSymptomsByCategory(category: string): Promise<SymptomsResponse> {
    const response = await this.client.get<SymptomsResponse>(
      `/symptoms/category/${category}`
    );
    return response.data;
  }

  async getSymptomsByTag(tag: string): Promise<SymptomsResponse> {
    const response = await this.client.get<SymptomsResponse>(
      `/symptoms/tag/${tag}`
    );
    return response.data;
  }

  async getSymptomsByPoint(pointId: string): Promise<SymptomsResponse> {
    const response = await this.client.get<SymptomsResponse>(
      `/symptoms/point/${pointId}`
    );
    return response.data;
  }

  async getPopularSymptoms(limit: number = 10): Promise<SymptomsResponse> {
    const response = await this.client.get<SymptomsResponse>(
      "/symptoms/popular",
      {
        params: { limit },
      }
    );
    return response.data;
  }

  async incrementSymptomUse(symptomId: string): Promise<void> {
    await this.client.post(`/symptoms/${symptomId}/use`);
  }

  // Favorites endpoints - Fixed to match backend
  async addFavorite(pointId: string): Promise<void> {
    await this.client.post(`/auth/favorites/${pointId}`);
  }

  async removeFavorite(pointId: string): Promise<void> {
    await this.client.delete(`/auth/favorites/${pointId}`);
  }

  async getFavorites(): Promise<{ points: Point[] }> {
    // Backend returns favorites as part of user profile
    const profile = await this.getProfile();
    const favoriteIds = (profile as any).favoritePoints || [];
    
    // If we have favorite IDs, fetch the actual points
    if (favoriteIds.length === 0) {
      return { points: [] };
    }
    
    // Fetch all points and filter by favorites
    const allPoints = await this.getPoints();
    const favoritePoints = allPoints.points.filter((p) =>
      favoriteIds.includes(p.id)
    );
    
    return { points: favoritePoints };
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    // Remove /api from the base URL for health check
    const healthUrl = API_BASE_URL.replace("/api", "") + "/health";
    const response = await axios.get(healthUrl);
    return response.data;
  }

  // Admin endpoints - Points
  async createPoint(pointData: Partial<Point>): Promise<{ point: Point }> {
    const response = await this.client.post<{ point: Point }>(
      "/points",
      pointData
    );
    return response.data;
  }

  async updatePoint(
    id: string,
    pointData: Partial<Point>
  ): Promise<{ point: Point }> {
    const response = await this.client.put<{ point: Point }>(
      `/points/${id}`,
      pointData
    );
    return response.data;
  }

  async deletePoint(id: string): Promise<void> {
    await this.client.delete(`/points/${id}`);
  }

  async updatePointCoordinates(
    pointId: string,
    x: number,
    y: number
  ): Promise<{ point: Point }> {
    const response = await this.client.put<{ point: Point }>(
      `/points/${pointId}/coordinates`,
      { x, y }
    );
    return response.data;
  }

  async addImageToPoint(
    pointId: string,
    imageUrl: string
  ): Promise<{ point: Point }> {
    return this.addImagesToPoint(pointId, [imageUrl]);
  }

  async addImagesToPoint(
    pointId: string,
    imageUrls: string[]
  ): Promise<{ point: Point }> {
    const response = await this.client.post<{ point: Point }>(
      `/points/${pointId}/images`,
      { imageUrls }
    );
    return response.data;
  }

  async reorderPointImages(
    pointId: string,
    imageUrls: string[]
  ): Promise<{ point: Point }> {
    const response = await this.client.put<{ point: Point }>(
      `/points/${pointId}/images/order`,
      { imageUrls }
    );
    return response.data;
  }

  async deletePointImage(pointId: string, imageUrl: string): Promise<void> {
    await this.client.delete(`/points/${pointId}/images`, {
      data: { imageUrl },
    });
  }

  async deleteStorageFile(imageUrl: string): Promise<void> {
    const fileName = imageUrl.split("/").pop();
    if (!fileName) {
      return;
    }

    await this.client.delete(`/storage/${encodeURIComponent(fileName)}`);
  }

  // Admin endpoints - Symptoms
  async createSymptom(
    symptomData: Partial<Symptom>
  ): Promise<{ symptom: Symptom }> {
    const response = await this.client.post<{ symptom: Symptom }>(
      "/symptoms",
      symptomData
    );
    return response.data;
  }

  async updateSymptom(
    id: string,
    symptomData: Partial<Symptom>
  ): Promise<{ symptom: Symptom }> {
    const response = await this.client.put<{ symptom: Symptom }>(
      `/symptoms/${id}`,
      symptomData
    );
    return response.data;
  }

  async deleteSymptom(id: string): Promise<void> {
    await this.client.delete(`/symptoms/${id}`);
  }

  // Notes endpoints
  async createNote(noteData: {
    pointId: string;
    content: string;
    userId: string;
  }): Promise<{ note: Note }> {
    const response = await this.client.post<{ note: Note }>(
      "/notes",
      noteData
    );
    return response.data;
  }

  async updateNote(
    noteId: string,
    noteData: {
      pointId: string;
      content: string;
      userId: string;
    }
  ): Promise<{ note: Note }> {
    const response = await this.client.put<{ note: Note }>(
      `/notes/${noteId}`,
      noteData
    );
    return response.data;
  }

  async deleteNote(noteId: string): Promise<void> {
    await this.client.delete(`/notes/${noteId}`);
  }

  async logSearchHistory(entry: {
    query: string;
    type: string;
    timestamp: string;
  }): Promise<void> {
    await this.client.post("/search/history", entry);
  }

  // Statistics
  async getPointStats(): Promise<any> {
    const response = await this.client.get("/points/stats");
    return response.data;
  }

  async getSymptomStats(): Promise<any> {
    const response = await this.client.get("/symptoms/stats");
    return response.data;
  }

  // Generic request method for custom endpoints
  async request<T = any>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    data?: any,
    params?: any
  ): Promise<T> {
    const response = await this.client.request<T>({
      method,
      url,
      data,
      params,
    });
    return response.data;
  }
}

export const apiService = new ApiService();
