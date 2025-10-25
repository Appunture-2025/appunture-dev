import type { User, LoginCredentials, RegisterData, UserProfile } from "./user";

// API Types
export interface Point {
  isFavorite: boolean;
  id: number;
  code: string;
  name: string;
  chinese_name?: string;
  meridian: string;
  location: string;
  indications?: string;
  contraindications?: string;
  coordinates?: {
    x: number;
    y: number;
  };
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Symptom {
  id: number;
  name: string;
  description?: string;
  category?: string;
  created_at?: string;
}

export interface PointWithSymptoms extends Point {
  symptoms: Array<Symptom & { efficacy_score: number }>;
}

export interface SymptomWithPoints extends Symptom {
  points: Array<Point & { efficacy_score: number }>;
}

// API Response Types
export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  token: string;
}

export interface PointsResponse {
  points: Point[];
  count: number;
}

export interface SymptomsResponse {
  symptoms: Symptom[];
  count: number;
}

export interface SearchResponse {
  points: Point[];
  count: number;
  searchTerm: string;
}

export interface MeridiansResponse {
  meridians: Array<{
    meridian: string;
    point_count: number;
  }>;
}

export interface CategoriesResponse {
  categories: Array<{
    category: string;
    symptom_count: number;
  }>;
}

// Error Types
export interface ApiError {
  error: string;
  message?: string;
}

// Local Database Types
export interface LocalPoint extends Point {
  synced: boolean;
  last_sync?: string;
}

export interface LocalSymptom extends Symptom {
  synced: boolean;
  last_sync?: string;
}

export interface Favorite {
  id: number;
  point_id: number;
  user_id: number;
  synced: boolean;
  created_at: string;
}

export interface Note {
  id: number;
  point_id: number;
  user_id: number;
  content: string;
  synced: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SymptomPoint {
  id: number;
  symptom_id: number;
  point_id: number;
  efficacy_score: number;
}

export type { User, LoginCredentials, RegisterData, UserProfile };
