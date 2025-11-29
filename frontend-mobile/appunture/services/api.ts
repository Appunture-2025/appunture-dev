import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders,
} from "axios";
import { createLogger } from "../utils/logger";
import {
  Point,
  Symptom,
  Note,
  User,
  PointsResponse,
  SymptomsResponse,
  SearchResponse,
  MeridiansResponse,
  CategoriesResponse,
  PointWithSymptoms,
  SymptomWithPoints,
  UserProfile,
  ApiError,
} from "../types/api";
import { API_BASE_URL } from "../utils/constants";
import { getStoredToken } from "./storage";
import { firebaseAuth } from "./firebase";

const apiLogger = createLogger("API");

/**
 * Error codes for different types of API errors
 */
export const API_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMIT: "RATE_LIMIT",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN: "UNKNOWN",
} as const;

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(error: ApiError): string {
  if (!error.status) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.";
  }
  
  switch (error.status) {
    case 400:
      return error.message || "Dados inválidos. Por favor, verifique as informações.";
    case 401:
      return "Sua sessão expirou. Por favor, faça login novamente.";
    case 403:
      return "Você não tem permissão para realizar esta ação.";
    case 404:
      return "O recurso solicitado não foi encontrado.";
    case 429:
      return "Muitas requisições. Por favor, aguarde um momento.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Erro no servidor. Por favor, tente novamente mais tarde.";
    default:
      return error.message || "Ocorreu um erro inesperado. Por favor, tente novamente.";
  }
}

class ApiService {
  private client: AxiosInstance;
  private retryCount: Map<string, number> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private readonly REQUEST_TIMEOUT_MS = 30000;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: this.REQUEST_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Check if error is retryable (network errors, 5xx errors)
   */
  private isRetryableError(error: AxiosError): boolean {
    // Retry on network errors
    if (!error.response) {
      return true;
    }
    
    // Retry on server errors (5xx)
    const status = error.response.status;
    return status >= 500 && status < 600;
  }

  /**
   * Get retry key for a request
   */
  private getRetryKey(config: InternalAxiosRequestConfig): string {
    return `${config.method}:${config.url}`;
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
            apiLogger.warn("Failed to retrieve Firebase ID token", error);
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
            (
              config.headers as Record<string, string>
            ).Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors with retry logic
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Clear retry count on success
        if (response.config) {
          const key = this.getRetryKey(response.config);
          this.retryCount.delete(key);
        }
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // Handle retryable errors
        if (config && this.isRetryableError(error) && !config._retry) {
          const key = this.getRetryKey(config);
          const currentRetries = this.retryCount.get(key) || 0;
          
          if (currentRetries < this.MAX_RETRIES) {
            this.retryCount.set(key, currentRetries + 1);
            config._retry = true;
            
            // Exponential backoff
            const delay = this.RETRY_DELAY_MS * Math.pow(2, currentRetries);
            apiLogger.info(`Retrying request (attempt ${currentRetries + 1}/${this.MAX_RETRIES}) after ${delay}ms`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.client(config);
          }
          
          // Max retries reached, clear count
          this.retryCount.delete(key);
        }

        // Handle 401 - try to refresh token
        if (error.response?.status === 401) {
          const currentUser = firebaseAuth.currentUser;
          if (currentUser && config && !config._retry) {
            try {
              config._retry = true;
              await currentUser.getIdToken(true); // Force refresh
              return this.client(config);
            } catch {
              apiLogger.warn("Token refresh failed");
            }
          }
        }

        // Build standardized error response
        const apiError: ApiError = {
          error: API_ERROR_CODES.UNKNOWN,
          message: "An unexpected error occurred",
        };

        if (error.response) {
          // Server responded with error status
          const responseData = error.response.data as {
            code?: string;
            error?: string;
            message?: string;
          };
          apiError.error = responseData?.code || responseData?.error || "Server Error";
          apiError.message = responseData?.message || error.message;
          apiError.status = error.response.status;
          
          // Map status to error code
          switch (error.response.status) {
            case 400:
              apiError.error = API_ERROR_CODES.VALIDATION_ERROR;
              break;
            case 401:
              apiError.error = API_ERROR_CODES.UNAUTHORIZED;
              break;
            case 403:
              apiError.error = API_ERROR_CODES.FORBIDDEN;
              break;
            case 404:
              apiError.error = API_ERROR_CODES.NOT_FOUND;
              break;
            case 429:
              apiError.error = API_ERROR_CODES.RATE_LIMIT;
              break;
            default:
              if (error.response.status >= 500) {
                apiError.error = API_ERROR_CODES.SERVER_ERROR;
              }
          }
        } else if (error.request) {
          // Request was made but no response received
          if (error.code === "ECONNABORTED") {
            apiError.error = API_ERROR_CODES.TIMEOUT_ERROR;
            apiError.message = "Request timed out. Please try again.";
          } else {
            apiError.error = API_ERROR_CODES.NETWORK_ERROR;
            apiError.message = "No response from server. Check your internet connection.";
          }
          apiError.status = undefined;
        } else {
          // Something else happened
          apiError.error = API_ERROR_CODES.UNKNOWN;
          apiError.message = error.message;
          apiError.status = undefined;
        }

        apiLogger.error(`API Error: ${apiError.error} - ${apiError.message}`);
        return Promise.reject(apiError);
      }
    );
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

  async getFavorites(
    page = 0,
    limit = 10
  ): Promise<{ points: Point[]; total: number; hasMore: boolean }> {
    const response = await this.client.get<{
      points: Point[];
      total: number;
      hasMore: boolean;
    }>("/auth/favorites", { params: { page, limit } });
    return response.data;
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
    const response = await this.client.post<{ note: Note }>("/notes", noteData);
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

  // Admin endpoints - Users
  async getUsers(): Promise<User[]> {
    const response = await this.client.get<User[]>("/admin/users");
    return response.data;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const response = await this.client.put<User>(
      `/admin/users/${userId}/role`,
      {
        role,
      }
    );
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.client.delete(`/admin/users/${userId}`);
  }

  async getAdminStats(): Promise<any> {
    const response = await this.client.get("/admin/stats");
    return response.data;
  }

  // AI Chat
  async chatWithAi(message: string): Promise<string> {
    try {
      const response = await this.client.post<{ response: string }>("/chat", {
        message,
      });
      return response.data.response;
    } catch (error) {
      apiLogger.error("AI Chat Error:", error);
      return "Desculpe, estou tendo dificuldades para me conectar ao servidor de inteligência no momento. Por favor, tente novamente mais tarde.";
    }
  }
}

export const apiService = new ApiService();
