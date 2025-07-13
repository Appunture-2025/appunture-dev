// Database Schema Types
export interface LocalPoint {
  id: number;
  name: string;
  chinese_name?: string;
  meridian: string;
  location: string;
  functions?: string;
  indications?: string;
  contraindications?: string;
  image_path?: string;
  coordinates?: string; // JSON string
  synced: boolean;
  last_sync?: string;
}

export interface LocalSymptom {
  id: number;
  name: string;
  synonyms?: string; // JSON string array
  category?: string;
  synced: boolean;
  last_sync?: string;
}

export interface SymptomPoint {
  id: number;
  symptom_id: number;
  point_id: number;
  efficacy_score: number;
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
