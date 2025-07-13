// Environment Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const config = {
  apiUrl: API_BASE_URL,
  appName: "Appunture Web",
  version: "1.0.0",
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
  theme: {
    primary: "#3b82f6",
    success: "#22c55e",
    warning: "#f97316",
    danger: "#ef4444",
  },
  features: {
    enableNotifications: true,
    enableExport: true,
    enableBulkActions: true,
  },
} as const;

// Constants
export const MERIDIANS = [
  "P - Pulmão",
  "IG - Intestino Grosso",
  "E - Estômago",
  "BP - Baço Pâncreas",
  "C - Coração",
  "ID - Intestino Delgado",
  "B - Bexiga",
  "R - Rim",
  "PC - Pericárdio",
  "TA - Triplo Aquecedor",
  "VB - Vesícula Biliar",
  "F - Fígado",
  "VG - Vaso Governador",
  "VC - Vaso Concepção",
  "EX - Extra Meridiano",
] as const;

export const USER_ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "user", label: "Usuário" },
] as const;

export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export const DATE_FORMATS = {
  short: "dd/MM/yyyy",
  long: "dd/MM/yyyy HH:mm",
  time: "HH:mm",
} as const;
