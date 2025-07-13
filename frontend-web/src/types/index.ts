// API Types
export interface Point {
  id: number;
  name: string;
  chinese_name?: string;
  meridian: string;
  location: string;
  indications?: string;
  functions?: string;
  contraindications?: string;
  created_at: string;
  updated_at: string;
}

export interface Symptom {
  id: number;
  name: string;
  description?: string;
  synonyms?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalPoints: number;
  totalSymptoms: number;
  totalUsers: number;
  recentUsers: number;
  pointsByMeridian: { meridian: string; count: number }[];
  userGrowth: { date: string; users: number }[];
}

// Form Types
export interface PointFormData {
  name: string;
  chinese_name?: string;
  meridian: string;
  location: string;
  indications?: string;
  functions?: string;
  contraindications?: string;
}

export interface SymptomFormData {
  name: string;
  description?: string;
  synonyms?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "user";
}

// Filter Types
export interface PointFilters {
  search?: string;
  meridian?: string;
  page?: number;
  limit?: number;
}

export interface SymptomFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserFilters {
  search?: string;
  role?: "admin" | "user";
  page?: number;
  limit?: number;
}

// Component Props Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}
