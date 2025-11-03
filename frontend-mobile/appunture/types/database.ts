// Database Schema Types
export interface LocalPoint {
  id: string;
  name: string;
  chinese_name?: string;
  meridian: string;
  location: string;
  functions?: string;
  indications?: string;
  contraindications?: string;
  image_path?: string;
  coordinates?: string; // JSON string
  code?: string;
  favorite_count?: number;
  synced: boolean;
  last_sync?: string;
}

export interface LocalSymptom {
  id: string;
  name: string;
  synonyms?: string; // JSON string array
  category?: string;
  use_count?: number;
  synced: boolean;
  last_sync?: string;
}

export interface SymptomPoint {
  symptom_id: string;
  point_id: string;
  efficacy_score: number;
}

export interface Favorite {
  id: number;
  point_id: string;
  user_id: string;
  synced: boolean;
  operation: "UPSERT" | "DELETE";
  created_at: string;
  updated_at?: string;
}

export interface Note {
  id: number;
  point_id: string;
  user_id: string;
  content: string;
  synced: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SearchHistory {
  id: number;
  query: string;
  type: "point" | "symptom" | "general";
  created_at: string;
}

export interface SyncStatus {
  id: number;
  table_name: string;
  last_sync: string;
  status: "success" | "error" | "pending";
}

export interface SyncOperation {
  id: number;
  entity: string;
  entity_id: string;
  operation: "UPSERT" | "DELETE" | string;
  payload?: string | null;
  status: "pending" | "in_progress" | "retry" | "failed";
  retry_count: number;
  last_attempt?: string;
  created_at: string;
}

export interface ImageSyncOperation {
  id: number;
  point_id: string;
  image_uri: string;
  payload?: string | null;
  status: "pending" | "in_progress" | "retry" | "failed";
  retry_count: number;
  last_attempt?: string;
  created_at: string;
}

// Database Operation Types
export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface DatabaseTransaction {
  executeSql: (
    sqlStatement: string,
    args?: any[],
    success?: (tx: DatabaseTransaction, result: any) => void,
    error?: (tx: DatabaseTransaction, error: any) => void
  ) => void;
}
