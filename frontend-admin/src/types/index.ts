// Types for Appunture Admin Dashboard

export interface Point {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  namePt?: string;
  nameChinese?: string;
  namePinyin?: string;
  meridian?: Meridian;
  number?: number;
  location: string;
  anatomicalLocation?: string;
  functions?: string[];
  indications?: string[];
  needleDepth?: string;
  techniques?: string[];
  cautions?: string[];
  notes?: string;
  imageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Meridian {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  namePt?: string;
  nameChinese?: string;
  namePinyin?: string;
  element?: string;
  yinYang?: string;
  organ?: string;
  pairedMeridian?: string;
  pathwayDescription?: string;
  totalPoints: number;
  notes?: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  photoURL?: string;
  role?: "USER" | "ADMIN";
  isAdmin?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  favoriteCount?: number;
  favoritesCount?: number;
}

export interface Stats {
  totalPoints: number;
  totalMeridians: number;
  totalUsers: number;
  activeUsers?: number;
  totalFavorites: number;
  pointsPerMeridian?: Record<string, number>;
  recentActivity?: ActivityItem[];
}

export interface ActivityItem {
  id?: string;
  type?: "CREATE" | "UPDATE" | "DELETE" | "LOGIN";
  entity?: string;
  entityId?: string;
  userId?: string;
  userName?: string;
  action: string;
  timestamp: string;
  description?: string;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface APIResponse<T> {
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export type { Column, DataTableProps } from "../components/DataTable";
export type { ModalProps, ConfirmModalProps } from "../components/Modal";
