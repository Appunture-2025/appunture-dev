import axios, { AxiosError, AxiosResponse } from "axios";
import toast from "react-hot-toast";
import { auth } from "../config/firebase";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/**
 * Standard API error response from backend
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  status: number;
  timestamp?: string;
  traceId?: string;
  path?: string;
  details?: Array<{
    field: string;
    message: string;
    rejectedValue?: unknown;
  }>;
}

/**
 * Custom error class for API errors with structured data
 */
export class ApiError extends Error {
  code: string;
  status: number;
  details?: ApiErrorResponse["details"];
  traceId?: string;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = "ApiError";
    this.code = response.code;
    this.status = response.status;
    this.details = response.details;
    this.traceId = response.traceId;
  }

  /**
   * Get user-friendly message for display
   */
  getUserMessage(): string {
    switch (this.code) {
      case "VALIDATION_ERROR":
        if (this.details && this.details.length > 0) {
          return this.details.map((d) => d.message).join(", ");
        }
        return "Por favor, verifique os dados informados.";
      case "NOT_FOUND":
        return "O recurso solicitado não foi encontrado.";
      case "UNAUTHORIZED":
        return "Você precisa estar autenticado para acessar este recurso.";
      case "FORBIDDEN":
        return "Você não tem permissão para acessar este recurso.";
      case "RATE_LIMIT_EXCEEDED":
        return "Muitas requisições. Por favor, aguarde um momento.";
      case "INTERNAL_ERROR":
        return "Ocorreu um erro inesperado. Por favor, tente novamente.";
      default:
        return this.message || "Ocorreu um erro. Por favor, tente novamente.";
    }
  }
}

/**
 * Axios client with interceptors for auth and error handling
 */
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds timeout

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Failed to get auth token:", error);
        // Don't block the request, let the backend handle unauthorized
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    // Handle network errors
    if (!error.response) {
      const networkError = new ApiError({
        code: "NETWORK_ERROR",
        message: "Não foi possível conectar ao servidor. Verifique sua conexão.",
        status: 0,
      });
      
      // Show toast for network errors
      toast.error(networkError.getUserMessage(), {
        id: "network-error", // Prevent duplicate toasts
        duration: 5000,
      });
      
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // Handle specific status codes
    switch (status) {
      case 401:
        // Token expired or invalid - try to refresh or redirect to login
        const user = auth.currentUser;
        if (user) {
          try {
            await user.getIdToken(true); // Force refresh
            // Retry the original request
            const originalRequest = error.config;
            if (originalRequest) {
              const newToken = await user.getIdToken();
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            }
          } catch {
            // Refresh failed, redirect to login
            window.location.href = "/login";
          }
        } else {
          window.location.href = "/login";
        }
        break;

      case 403:
        toast.error("Você não tem permissão para realizar esta ação.", {
          id: "forbidden-error",
        });
        break;

      case 429:
        toast.error("Muitas requisições. Por favor, aguarde um momento.", {
          id: "rate-limit-error",
          duration: 5000,
        });
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        toast.error("Erro no servidor. Por favor, tente novamente mais tarde.", {
          id: "server-error",
        });
        break;
    }

    // Create structured error
    const apiError = new ApiError({
      code: data?.code || "UNKNOWN_ERROR",
      message: data?.message || "Ocorreu um erro inesperado.",
      status: status,
      details: data?.details,
      traceId: data?.traceId,
    });

    return Promise.reject(apiError);
  }
);

export default apiClient;
