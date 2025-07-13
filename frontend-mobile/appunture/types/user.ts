// User and Auth Types
export interface User {
  id: number;
  email: string;
  name: string;
  profession?: string;
  role: "user" | "admin";
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  profession?: string;
}

export interface UserProfile {
  name: string;
  profession?: string;
}

// App State Types
export interface AppSettings {
  theme: "light" | "dark";
  language: "pt" | "en";
  offlineMode: boolean;
  syncOnWifiOnly: boolean;
  notificationsEnabled: boolean;
}

export interface SyncState {
  isOnline: boolean;
  lastSync?: string;
  syncInProgress: boolean;
  autoSync: boolean;
}

// Navigation Types
export interface RootStackParamList {
  "(tabs)": undefined;
  "(auth)": undefined;
  "point/[id]": { id: string };
  "body-map": undefined;
  modal: undefined;
}

export interface TabsParamList {
  index: undefined;
  search: undefined;
  chatbot: undefined;
  favorites: undefined;
  profile: undefined;
}

export interface AuthParamList {
  login: undefined;
  register: undefined;
}

// Component Props Types
export interface PointCardProps {
  point: Point;
  onPress: () => void;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

// Import from api.ts to avoid circular imports
import { Point, Symptom, PointWithSymptoms, SymptomWithPoints } from "./api";
