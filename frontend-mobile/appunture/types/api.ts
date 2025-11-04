import type { User, LoginCredentials, RegisterData, UserProfile } from "./user";

// API Types
export interface Point {
  isFavorite: boolean;
  id: string; // Firestore uses string IDs
  code: string;
  name: string;
  chinese_name?: string;
  chineseName?: string; // Backend uses camelCase
  meridian: string;
  location: string;
  indications?: string;
  contraindications?: string;
  functions?: string;
  coordinates?: {
    x: number;
    y: number;
  };
  image_url?: string; // Legacy support
  imageUrls?: string[]; // Backend supports multiple images
  favoriteCount?: number; // Backend tracks favorites
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Backend uses camelCase
  updatedAt?: string; // Backend uses camelCase
  pendingSync?: boolean;
}

export interface Symptom {
  id: string; // Firestore uses string IDs
  name: string;
  description?: string;
  category?: string;
  severity?: number; // Backend has severity field (0-10)
  tags?: string[]; // Backend supports tags
  useCount?: number; // Backend tracks usage
  created_at?: string;
  createdAt?: string; // Backend uses camelCase
  updated_at?: string;
  updatedAt?: string;
  pendingSync?: boolean;
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
  status?: number;
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
  id?: number; // Local DB ID
  point_id: string; // Changed to string to match Firestore
  user_id: string; // Changed to string to match Firestore
  synced: boolean;
  created_at: string;
}

export interface Note {
  id?: number; // Local DB ID
  point_id: string; // Changed to string to match Firestore
  user_id: string; // Changed to string to match Firestore
  content: string;
  synced: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SymptomPoint {
  id?: number; // Local DB ID
  symptom_id: string; // Changed to string to match Firestore
  point_id: string; // Changed to string to match Firestore
  efficacy_score: number;
}

export type { User, LoginCredentials, RegisterData, UserProfile };
