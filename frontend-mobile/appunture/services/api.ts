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
        } else if (error.request) {
          // Request was made but no response received
          apiError.error = "Network Error";
          apiError.message = "No response from server";
        } else {
          // Something else happened
          apiError.error = "Request Error";
          apiError.message = error.message;
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

  async getPoint(id: number): Promise<{ point: PointWithSymptoms }> {
    const response = await this.client.get<{ point: PointWithSymptoms }>(
      `/points/${id}`
    );
    return response.data;
  }

  async searchPoints(query: string): Promise<SearchResponse> {
    const response = await this.client.get<SearchResponse>("/points/search", {
      params: { q: query },
    });
    return response.data;
  }

  async getPointsBySymptom(symptomId: number): Promise<PointsResponse> {
    const response = await this.client.get<PointsResponse>(
      `/points/symptom/${symptomId}`
    );
    return response.data;
  }

  async getMeridians(): Promise<MeridiansResponse> {
    const response = await this.client.get<MeridiansResponse>(
      "/points/meridians"
    );
    return response.data;
  }

  // Symptoms endpoints
  async getSymptoms(params?: { category?: string }): Promise<SymptomsResponse> {
    const response = await this.client.get<SymptomsResponse>("/symptoms", {
      params,
    });
    return response.data;
  }

  async getSymptom(id: number): Promise<{ symptom: SymptomWithPoints }> {
    const response = await this.client.get<{ symptom: SymptomWithPoints }>(
      `/symptoms/${id}`
    );
    return response.data;
  }

  async searchSymptoms(query: string): Promise<SymptomsResponse> {
    const response = await this.client.get<SymptomsResponse>(
      "/symptoms/search",
      {
        params: { q: query },
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

  // Favorites endpoints (if implemented in backend)
  async addFavorite(pointId: number): Promise<void> {
    await this.client.post(`/favorites`, { pointId });
  }

  async removeFavorite(pointId: number): Promise<void> {
    await this.client.delete(`/favorites/${pointId}`);
  }

  async getFavorites(): Promise<{ points: Point[] }> {
    const response = await this.client.get<{ points: Point[] }>("/favorites");
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    // Remove /api from the base URL for health check
    const healthUrl = API_BASE_URL.replace("/api", "") + "/health";
    const response = await axios.get(healthUrl);
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
