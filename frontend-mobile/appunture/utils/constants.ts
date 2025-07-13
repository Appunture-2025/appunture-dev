// App Constants
export const API_BASE_URL = __DEV__
  ? "http://localhost:3000/api"
  : "https://your-production-api.com/api";

export const COLORS = {
  primary: "#007aff",
  secondary: "#5856d6",
  accent: "#ff9500",
  background: "#f8f9fa",
  surface: "#ffffff",
  text: "#000000",
  textSecondary: "#666666",
  border: "#e1e5e9",
  error: "#ff3b30",
  warning: "#ff9500",
  success: "#34c759",
  info: "#007aff",
};

export const DARK_COLORS = {
  primary: "#0a84ff",
  secondary: "#5e5ce6",
  accent: "#ff9f0a",
  background: "#000000",
  surface: "#1c1c1e",
  text: "#ffffff",
  textSecondary: "#8e8e93",
  border: "#38383a",
  error: "#ff453a",
  warning: "#ff9f0a",
  success: "#30d158",
  info: "#64d2ff",
};

export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
  light: "System",
};

export const SIZES = {
  base: 16,
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  xxlarge: 32,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const MERIDIANS = [
  "Lung",
  "Large Intestine",
  "Stomach",
  "Spleen",
  "Heart",
  "Small Intestine",
  "Bladder",
  "Kidney",
  "Pericardium",
  "Triple Heater",
  "Gallbladder",
  "Liver",
  "Governing Vessel",
  "Conception Vessel",
];

export const SYMPTOM_CATEGORIES = [
  "Pain",
  "Digestive",
  "Respiratory",
  "Cardiovascular",
  "Neurological",
  "Mental Health",
  "Sleep",
  "Gynecological",
  "Musculoskeletal",
  "Skin",
  "General",
];

export const PROFESSIONS = [
  "Médico",
  "Fisioterapeuta",
  "Acupunturista",
  "Terapeuta",
  "Enfermeiro",
  "Estudante",
  "Outro",
];

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  SETTINGS: "app_settings",
  LAST_SYNC: "last_sync",
  OFFLINE_DATA: "offline_data",
};

export const QUERY_KEYS = {
  POINTS: "points",
  SYMPTOMS: "symptoms",
  POINT_DETAILS: "point_details",
  SYMPTOM_DETAILS: "symptom_details",
  SEARCH: "search",
  FAVORITES: "favorites",
  MERIDIANS: "meridians",
  CATEGORIES: "categories",
};

export const SYNC_INTERVALS = {
  MANUAL: 0,
  HOURLY: 60 * 60 * 1000,
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
};

export const MAX_SEARCH_RESULTS = 50;
export const MAX_RECENT_SEARCHES = 10;
export const DATABASE_VERSION = 1;
export const DATABASE_NAME = "appunture.db";
