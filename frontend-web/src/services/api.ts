import axios, { AxiosInstance, AxiosResponse } from "axios";
import { config } from "@/utils/constants";
import { getFromStorage, removeFromStorage } from "@/utils/helpers";
import toast from "react-hot-toast";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: config.apiUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = getFromStorage("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          removeFromStorage("auth_token");
          removeFromStorage("user_data");
          window.location.href = "/login";
          toast.error("Sessão expirada. Faça login novamente.");
        } else if (error.response?.status >= 500) {
          toast.error("Erro interno do servidor. Tente novamente mais tarde.");
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.message) {
          toast.error(error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    const response = await this.api.post("/auth/login", credentials);
    return response.data;
  }

  async register(data: { name: string; email: string; password: string }) {
    const response = await this.api.post("/auth/register", data);
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get("/auth/profile");
    return response.data;
  }

  // Points endpoints
  async getPoints(params?: {
    page?: number;
    limit?: number;
    search?: string;
    meridian?: string;
  }) {
    const response = await this.api.get("/points", { params });
    return response.data;
  }

  async getPoint(id: number) {
    const response = await this.api.get(`/points/${id}`);
    return response.data;
  }

  async createPoint(data: any) {
    const response = await this.api.post("/points", data);
    return response.data;
  }

  async updatePoint(id: number, data: any) {
    const response = await this.api.put(`/points/${id}`, data);
    return response.data;
  }

  async deletePoint(id: number) {
    const response = await this.api.delete(`/points/${id}`);
    return response.data;
  }

  // Symptoms endpoints
  async getSymptoms(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const response = await this.api.get("/symptoms", { params });
    return response.data;
  }

  async getSymptom(id: number) {
    const response = await this.api.get(`/symptoms/${id}`);
    return response.data;
  }

  async createSymptom(data: any) {
    const response = await this.api.post("/symptoms", data);
    return response.data;
  }

  async updateSymptom(id: number, data: any) {
    const response = await this.api.put(`/symptoms/${id}`, data);
    return response.data;
  }

  async deleteSymptom(id: number) {
    const response = await this.api.delete(`/symptoms/${id}`);
    return response.data;
  }

  // Users endpoints (admin only)
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    const response = await this.api.get("/admin/users", { params });
    return response.data;
  }

  async getUser(id: number) {
    const response = await this.api.get(`/admin/users/${id}`);
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.api.post("/admin/users", data);
    return response.data;
  }

  async updateUser(id: number, data: any) {
    const response = await this.api.put(`/admin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number) {
    const response = await this.api.delete(`/admin/users/${id}`);
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats() {
    const response = await this.api.get("/admin/dashboard/stats");
    return response.data;
  }

  // File upload
  async uploadFile(file: File, onUploadProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Export endpoints
  async exportPoints(format: "csv" | "json" = "csv") {
    const response = await this.api.get(
      `/admin/export/points?format=${format}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }

  async exportSymptoms(format: "csv" | "json" = "csv") {
    const response = await this.api.get(
      `/admin/export/symptoms?format=${format}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }

  async exportUsers(format: "csv" | "json" = "csv") {
    const response = await this.api.get(
      `/admin/export/users?format=${format}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.api.get("/health");
    return response.data;
  }
}

export const apiService = new ApiService();
