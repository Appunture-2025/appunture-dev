import * as SQLite from "expo-sqlite";
import {
  LocalPoint,
  LocalSymptom,
  SymptomPoint,
  Favorite,
  Note,
  SearchHistory,
  SyncStatus,
  DatabaseResult,
} from "../types/database";
import { DATABASE_NAME, DATABASE_VERSION } from "../utils/constants";

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await this.createTables();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const queries = [
      // Points table
      `CREATE TABLE IF NOT EXISTS points (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        chinese_name TEXT,
        meridian TEXT NOT NULL,
        location TEXT NOT NULL,
        functions TEXT,
        indications TEXT,
        contraindications TEXT,
        image_path TEXT,
        coordinates TEXT,
        synced BOOLEAN DEFAULT 0,
        last_sync DATETIME
      )`,

      // Symptoms table
      `CREATE TABLE IF NOT EXISTS symptoms (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        synonyms TEXT,
        category TEXT,
        synced BOOLEAN DEFAULT 0,
        last_sync DATETIME
      )`,

      // Symptom-Point relationship table
      `CREATE TABLE IF NOT EXISTS symptom_points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symptom_id INTEGER NOT NULL,
        point_id INTEGER NOT NULL,
        efficacy_score REAL DEFAULT 1.0,
        FOREIGN KEY(symptom_id) REFERENCES symptoms(id),
        FOREIGN KEY(point_id) REFERENCES points(id),
        UNIQUE(symptom_id, point_id)
      )`,

      // Favorites table
      `CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        point_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        synced BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(point_id) REFERENCES points(id),
        UNIQUE(point_id, user_id)
      )`,

      // Notes table
      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        point_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        synced BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(point_id) REFERENCES points(id)
      )`,

      // Search history table
      `CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Sync status table
      `CREATE TABLE IF NOT EXISTS sync_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL UNIQUE,
        last_sync DATETIME NOT NULL,
        status TEXT NOT NULL DEFAULT 'success'
      )`,

      // Indexes for better performance
      `CREATE INDEX IF NOT EXISTS idx_points_meridian ON points(meridian)`,
      `CREATE INDEX IF NOT EXISTS idx_points_name ON points(name)`,
      `CREATE INDEX IF NOT EXISTS idx_symptoms_category ON symptoms(category)`,
      `CREATE INDEX IF NOT EXISTS idx_symptom_points_symptom ON symptom_points(symptom_id)`,
      `CREATE INDEX IF NOT EXISTS idx_symptom_points_point ON symptom_points(point_id)`,
      `CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_notes_point ON notes(point_id)`,
    ];

    for (const query of queries) {
      await this.db.execAsync(query);
    }
  }

  // Points operations
  async insertPoint(point: Omit<LocalPoint, "id">): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.runAsync(
      `INSERT INTO points (name, chinese_name, meridian, location, functions, indications, contraindications, image_path, coordinates, synced, last_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        point.name,
        point.chinese_name || null,
        point.meridian,
        point.location,
        point.functions || null,
        point.indications || null,
        point.contraindications || null,
        point.image_path || null,
        point.coordinates || null,
        point.synced ? 1 : 0,
        point.last_sync || null,
      ]
    );

    return result.lastInsertRowId;
  }

  async getPoints(limit?: number, offset?: number): Promise<LocalPoint[]> {
    if (!this.db) throw new Error("Database not initialized");

    let query = "SELECT * FROM points ORDER BY meridian, name";
    const params: any[] = [];

    if (limit) {
      query += " LIMIT ?";
      params.push(limit);

      if (offset) {
        query += " OFFSET ?";
        params.push(offset);
      }
    }

    const result = await this.db.getAllAsync(query, params);
    return result as LocalPoint[];
  }

  async getPointById(id: number): Promise<LocalPoint | null> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync(
      "SELECT * FROM points WHERE id = ?",
      [id]
    );

    return result as LocalPoint | null;
  }

  async searchPoints(query: string): Promise<LocalPoint[]> {
    if (!this.db) throw new Error("Database not initialized");

    const searchTerm = `%${query}%`;
    const result = await this.db.getAllAsync(
      `SELECT * FROM points 
       WHERE name LIKE ? OR chinese_name LIKE ? OR meridian LIKE ? OR location LIKE ? OR indications LIKE ?
       ORDER BY 
         CASE 
           WHEN name LIKE ? THEN 1
           WHEN chinese_name LIKE ? THEN 2
           WHEN meridian LIKE ? THEN 3
           ELSE 4
         END`,
      [
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
      ]
    );

    return result as LocalPoint[];
  }

  async getPointsByMeridian(meridian: string): Promise<LocalPoint[]> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      "SELECT * FROM points WHERE meridian = ? ORDER BY name",
      [meridian]
    );

    return result as LocalPoint[];
  }

  // Symptoms operations
  async insertSymptom(symptom: Omit<LocalSymptom, "id">): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.runAsync(
      `INSERT INTO symptoms (name, synonyms, category, synced, last_sync)
       VALUES (?, ?, ?, ?, ?)`,
      [
        symptom.name,
        symptom.synonyms || null,
        symptom.category || null,
        symptom.synced ? 1 : 0,
        symptom.last_sync || null,
      ]
    );

    return result.lastInsertRowId;
  }

  async getSymptoms(): Promise<LocalSymptom[]> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      "SELECT * FROM symptoms ORDER BY category, name"
    );

    return result as LocalSymptom[];
  }

  async searchSymptoms(query: string): Promise<LocalSymptom[]> {
    if (!this.db) throw new Error("Database not initialized");

    const searchTerm = `%${query}%`;
    const result = await this.db.getAllAsync(
      "SELECT * FROM symptoms WHERE name LIKE ? OR synonyms LIKE ? ORDER BY name",
      [searchTerm, searchTerm]
    );

    return result as LocalSymptom[];
  }

  // Favorites operations
  async addFavorite(pointId: number, userId: number): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.runAsync(
      "INSERT OR REPLACE INTO favorites (point_id, user_id, synced) VALUES (?, ?, ?)",
      [pointId, userId, 0]
    );

    return result.lastInsertRowId;
  }

  async removeFavorite(pointId: number, userId: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      "DELETE FROM favorites WHERE point_id = ? AND user_id = ?",
      [pointId, userId]
    );
  }

  async getFavorites(userId: number): Promise<LocalPoint[]> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      `SELECT p.* FROM points p
       JOIN favorites f ON p.id = f.point_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    return result as LocalPoint[];
  }

  async isFavorite(pointId: number, userId: number): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync(
      "SELECT id FROM favorites WHERE point_id = ? AND user_id = ?",
      [pointId, userId]
    );

    return result !== null;
  }

  // Notes operations
  async addNote(
    pointId: number,
    userId: number,
    content: string
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.runAsync(
      "INSERT INTO notes (point_id, user_id, content, synced) VALUES (?, ?, ?, ?)",
      [pointId, userId, content, 0]
    );

    return result.lastInsertRowId;
  }

  async updateNote(id: number, content: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      "UPDATE notes SET content = ?, updated_at = CURRENT_TIMESTAMP, synced = 0 WHERE id = ?",
      [content, id]
    );
  }

  async deleteNote(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync("DELETE FROM notes WHERE id = ?", [id]);
  }

  async getNotes(pointId: number, userId: number): Promise<Note[]> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      "SELECT * FROM notes WHERE point_id = ? AND user_id = ? ORDER BY created_at DESC",
      [pointId, userId]
    );

    return result as Note[];
  }

  // Search history operations
  async addSearchHistory(query: string, type: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      "INSERT INTO search_history (query, type) VALUES (?, ?)",
      [query, type]
    );

    // Keep only last 50 searches
    await this.db.runAsync(
      "DELETE FROM search_history WHERE id NOT IN (SELECT id FROM search_history ORDER BY created_at DESC LIMIT 50)"
    );
  }

  async getSearchHistory(type?: string): Promise<SearchHistory[]> {
    if (!this.db) throw new Error("Database not initialized");

    let query = "SELECT * FROM search_history";
    const params: any[] = [];

    if (type) {
      query += " WHERE type = ?";
      params.push(type);
    }

    query += " ORDER BY created_at DESC LIMIT 10";

    const result = await this.db.getAllAsync(query, params);
    return result as SearchHistory[];
  }

  // Sync operations
  async markAsSynced(table: string, id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      `UPDATE ${table} SET synced = 1, last_sync = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );
  }

  async getUnsyncedRecords(table: string): Promise<any[]> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      `SELECT * FROM ${table} WHERE synced = 0`
    );

    return result;
  }

  async updateSyncStatus(tableName: string, status: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(
      "INSERT OR REPLACE INTO sync_status (table_name, last_sync, status) VALUES (?, CURRENT_TIMESTAMP, ?)",
      [tableName, status]
    );
  }

  async getLastSync(tableName: string): Promise<string | null> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync(
      "SELECT last_sync FROM sync_status WHERE table_name = ?",
      [tableName]
    );

    return result ? (result as any).last_sync : null;
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const tables = [
      "points",
      "symptoms",
      "symptom_points",
      "favorites",
      "notes",
      "search_history",
      "sync_status",
    ];

    for (const table of tables) {
      await this.db.runAsync(`DELETE FROM ${table}`);
    }
  }

  // Close database connection
  async close(): Promise<void> {
    if (this.db) {
      // Note: SQLite databases are automatically closed when the app is terminated
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();
