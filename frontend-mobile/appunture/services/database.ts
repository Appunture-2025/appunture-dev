import * as SQLite from "expo-sqlite";
import {
  LocalPoint,
  LocalSymptom,
  Favorite,
  Note,
  SearchHistory,
  SyncOperation,
  ImageSyncOperation,
} from "../types/database";
import { DATABASE_NAME, DATABASE_VERSION } from "../utils/constants";

const MAX_QUEUE_RETRIES = 5;

type RawRow = Record<string, any>;

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await this.db.execAsync("PRAGMA foreign_keys = ON;");
      await this.db.execAsync("PRAGMA journal_mode = WAL;");
      await this.applyMigrations();
      await this.createIndexes();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  private getDb(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db;
  }

  private async applyMigrations(): Promise<void> {
    const db = this.getDb();

    const legacySchema = await this.isLegacySchema();
    if (legacySchema) {
      await this.migrateLegacySchema();
    } else {
      await this.createSchemaIfMissing();
    }

    await this.setUserVersion(DATABASE_VERSION);
  }

  private async isLegacySchema(): Promise<boolean> {
    const db = this.getDb();
    try {
      const tableInfo = (await db.getAllAsync(
        "PRAGMA table_info(points)"
      )) as Array<RawRow>;
      if (!tableInfo || tableInfo.length === 0) {
        return false;
      }
      const idColumn = tableInfo.find((column) => column.name === "id");
      if (!idColumn) {
        return false;
      }
      return String(idColumn.type ?? "").toUpperCase() !== "TEXT";
    } catch {
      return false;
    }
  }

  private async migrateLegacySchema(): Promise<void> {
    const db = this.getDb();
    console.log("Migrating local database to schema version 2");

    const [points, symptoms, symptomPoints, favorites, notes, syncStatus] =
      await Promise.all([
        db.getAllAsync("SELECT * FROM points") as Promise<Array<RawRow>>,
        db.getAllAsync("SELECT * FROM symptoms") as Promise<Array<RawRow>>,
        db.getAllAsync("SELECT * FROM symptom_points") as Promise<Array<RawRow>>,
        db.getAllAsync("SELECT * FROM favorites") as Promise<Array<RawRow>>,
        db.getAllAsync("SELECT * FROM notes") as Promise<Array<RawRow>>,
        db.getAllAsync("SELECT * FROM sync_status") as Promise<Array<RawRow>>,
      ]);

    await db.execAsync("BEGIN TRANSACTION");
    try {
      const tables = [
        "points",
        "symptoms",
        "symptom_points",
        "favorites",
        "notes",
        "sync_status",
        "sync_queue",
        "image_sync_queue",
      ];
      for (const table of tables) {
        await db.execAsync(`DROP TABLE IF EXISTS ${table}`);
      }

      await this.createSchemaIfMissing();

      for (const point of points) {
        await db.runAsync(
          `INSERT INTO points (id, code, name, chinese_name, meridian, location, functions, indications, contraindications, image_path, coordinates, favorite_count, synced, last_sync)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            String(point.id),
            point.code ?? null,
            point.name,
            point.chinese_name ?? null,
            point.meridian,
            point.location,
            point.functions ?? null,
            point.indications ?? null,
            point.contraindications ?? null,
            point.image_path ?? null,
            point.coordinates ?? null,
            point.favorite_count ?? null,
            point.synced === 0 ? 0 : 1,
            point.last_sync ?? null,
          ]
        );
      }

      for (const symptom of symptoms) {
        await db.runAsync(
          `INSERT INTO symptoms (id, name, synonyms, category, use_count, synced, last_sync)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            String(symptom.id),
            symptom.name,
            symptom.synonyms ?? null,
            symptom.category ?? null,
            symptom.use_count ?? null,
            symptom.synced === 0 ? 0 : 1,
            symptom.last_sync ?? null,
          ]
        );
      }

      for (const relation of symptomPoints) {
        await db.runAsync(
          `INSERT OR REPLACE INTO symptom_points (symptom_id, point_id, efficacy_score)
           VALUES (?, ?, ?)`,
          [
            String(relation.symptom_id),
            String(relation.point_id),
            relation.efficacy_score ?? 1,
          ]
        );
      }

      for (const favorite of favorites) {
        await db.runAsync(
          `INSERT OR REPLACE INTO favorites (point_id, user_id, synced, operation, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            String(favorite.point_id),
            String(favorite.user_id ?? favorite.userId ?? "local"),
            favorite.synced === 0 ? 0 : 1,
            "UPSERT",
            favorite.created_at ?? new Date().toISOString(),
            favorite.updated_at ?? favorite.created_at ?? new Date().toISOString(),
          ]
        );
      }

      for (const note of notes) {
        await db.runAsync(
          `INSERT INTO notes (point_id, user_id, content, synced, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            String(note.point_id),
            String(note.user_id ?? note.userId ?? "local"),
            note.content,
            note.synced === 0 ? 0 : 1,
            note.created_at ?? new Date().toISOString(),
            note.updated_at ?? note.created_at ?? new Date().toISOString(),
          ]
        );
      }

      for (const status of syncStatus) {
        await db.runAsync(
          `INSERT OR REPLACE INTO sync_status (table_name, last_sync, status)
           VALUES (?, ?, ?)`,
          [
            status.table_name,
            status.last_sync ?? new Date().toISOString(),
            status.status ?? "success",
          ]
        );
      }

      await db.execAsync("COMMIT");
    } catch (error) {
      await db.execAsync("ROLLBACK");
      console.error("Failed to migrate legacy schema:", error);
      throw error;
    }
  }

  private async createSchemaIfMissing(): Promise<void> {
    const db = this.getDb();

    await db.execAsync(`CREATE TABLE IF NOT EXISTS points (
      id TEXT PRIMARY KEY,
      code TEXT,
      name TEXT NOT NULL,
      chinese_name TEXT,
      meridian TEXT NOT NULL,
      location TEXT NOT NULL,
      functions TEXT,
      indications TEXT,
      contraindications TEXT,
      image_path TEXT,
      coordinates TEXT,
      favorite_count INTEGER,
      synced INTEGER DEFAULT 1,
      last_sync DATETIME
    )`);

    await db.execAsync(`CREATE TABLE IF NOT EXISTS symptoms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      synonyms TEXT,
      category TEXT,
      use_count INTEGER,
      synced INTEGER DEFAULT 1,
      last_sync DATETIME
    )`);

    await db.execAsync(`CREATE TABLE IF NOT EXISTS symptom_points (
      symptom_id TEXT NOT NULL,
      point_id TEXT NOT NULL,
      efficacy_score REAL DEFAULT 1.0,
      PRIMARY KEY(symptom_id, point_id)
    )`);

    await db.execAsync(`CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      point_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      operation TEXT NOT NULL DEFAULT 'UPSERT',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(point_id, user_id)
    )`);

    await db.execAsync(`CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      point_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.execAsync(`CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.execAsync(`CREATE TABLE IF NOT EXISTS sync_status (
      table_name TEXT PRIMARY KEY,
      last_sync DATETIME NOT NULL,
      status TEXT NOT NULL DEFAULT 'success'
    )`);

    await db.execAsync(`CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      retry_count INTEGER NOT NULL DEFAULT 0,
      last_attempt DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.execAsync(`CREATE TABLE IF NOT EXISTS image_sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      point_id TEXT NOT NULL,
      image_uri TEXT NOT NULL,
      payload TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      retry_count INTEGER NOT NULL DEFAULT 0,
      last_attempt DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }

  private async createIndexes(): Promise<void> {
    const db = this.getDb();

    const statements = [
      "CREATE INDEX IF NOT EXISTS idx_points_meridian ON points(meridian)",
      "CREATE INDEX IF NOT EXISTS idx_points_name ON points(name)",
      "CREATE INDEX IF NOT EXISTS idx_symptoms_category ON symptoms(category)",
      "CREATE INDEX IF NOT EXISTS idx_symptom_points_symptom ON symptom_points(symptom_id)",
      "CREATE INDEX IF NOT EXISTS idx_symptom_points_point ON symptom_points(point_id)",
      "CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_favorites_point ON favorites(point_id)",
      "CREATE INDEX IF NOT EXISTS idx_notes_point ON notes(point_id)",
      "CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status)",
      "CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity, entity_id)",
      "CREATE INDEX IF NOT EXISTS idx_image_sync_queue_status ON image_sync_queue(status)",
      "CREATE INDEX IF NOT EXISTS idx_image_sync_queue_point ON image_sync_queue(point_id)",
    ];

    for (const statement of statements) {
      await db.execAsync(statement);
    }
  }

  private async setUserVersion(version: number): Promise<void> {
    const db = this.getDb();
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }

  // Points operations

  async upsertPoint(point: LocalPoint): Promise<void> {
    const db = this.getDb();

    await db.runAsync(
      `INSERT INTO points (id, code, name, chinese_name, meridian, location, functions, indications, contraindications, image_path, coordinates, favorite_count, synced, last_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         code = excluded.code,
         name = excluded.name,
         chinese_name = excluded.chinese_name,
         meridian = excluded.meridian,
         location = excluded.location,
         functions = excluded.functions,
         indications = excluded.indications,
         contraindications = excluded.contraindications,
         image_path = excluded.image_path,
         coordinates = excluded.coordinates,
         favorite_count = excluded.favorite_count,
         synced = excluded.synced,
         last_sync = excluded.last_sync`,
      [
        point.id,
        point.code ?? null,
        point.name,
        point.chinese_name ?? null,
        point.meridian,
        point.location,
        point.functions ?? null,
        point.indications ?? null,
        point.contraindications ?? null,
        point.image_path ?? null,
        point.coordinates ?? null,
        point.favorite_count ?? null,
        point.synced ? 1 : 0,
        point.last_sync ?? new Date().toISOString(),
      ]
    );
  }

  async upsertPoints(points: LocalPoint[]): Promise<void> {
    if (points.length === 0) {
      return;
    }
    const db = this.getDb();
    await db.execAsync("BEGIN TRANSACTION");
    try {
      for (const point of points) {
        await this.upsertPoint(point);
      }
      await db.execAsync("COMMIT");
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  }

  async removePointsNotIn(ids: string[]): Promise<void> {
    const db = this.getDb();
    if (ids.length === 0) {
      await db.execAsync("DELETE FROM points");
      return;
    }

    const placeholders = ids.map(() => "?").join(", ");
    await db.runAsync(
      `DELETE FROM points WHERE id NOT IN (${placeholders})`,
      ids
    );
  }

  async getPoints(limit?: number, offset?: number): Promise<LocalPoint[]> {
    const db = this.getDb();
    let query = "SELECT * FROM points ORDER BY meridian, name";
    const params: any[] = [];

    if (typeof limit === "number") {
      query += " LIMIT ?";
      params.push(limit);
      if (typeof offset === "number") {
        query += " OFFSET ?";
        params.push(offset);
      }
    }

    const result = (await db.getAllAsync(query, params)) as LocalPoint[];
    return result;
  }

  async getPointById(id: string): Promise<LocalPoint | null> {
    const db = this.getDb();
    const row = await db.getFirstAsync("SELECT * FROM points WHERE id = ?", [
      id,
    ]);
    return (row as LocalPoint) ?? null;
  }

  async searchPoints(query: string): Promise<LocalPoint[]> {
    const db = this.getDb();
    const searchTerm = `%${query}%`;
    const result = (await db.getAllAsync(
      `SELECT * FROM points 
       WHERE name LIKE ? OR chinese_name LIKE ? OR meridian LIKE ? OR location LIKE ? OR indications LIKE ?
       ORDER BY name`,
      [
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
      ]
    )) as LocalPoint[];
    return result;
  }

  async getPointsByMeridian(meridian: string): Promise<LocalPoint[]> {
    const db = this.getDb();
    const result = (await db.getAllAsync(
      "SELECT * FROM points WHERE meridian = ? ORDER BY name",
      [meridian]
    )) as LocalPoint[];
    return result;
  }

  // Symptoms operations

  async upsertSymptom(symptom: LocalSymptom): Promise<void> {
    const db = this.getDb();
    await db.runAsync(
      `INSERT INTO symptoms (id, name, synonyms, category, use_count, synced, last_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         synonyms = excluded.synonyms,
         category = excluded.category,
         use_count = excluded.use_count,
         synced = excluded.synced,
         last_sync = excluded.last_sync`,
      [
        symptom.id,
        symptom.name,
        symptom.synonyms ?? null,
        symptom.category ?? null,
        symptom.use_count ?? null,
        symptom.synced ? 1 : 0,
        symptom.last_sync ?? new Date().toISOString(),
      ]
    );
  }

  async upsertSymptoms(symptoms: LocalSymptom[]): Promise<void> {
    if (symptoms.length === 0) {
      return;
    }
    const db = this.getDb();
    await db.execAsync("BEGIN TRANSACTION");
    try {
      for (const symptom of symptoms) {
        await this.upsertSymptom(symptom);
      }
      await db.execAsync("COMMIT");
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  }

  async getSymptoms(): Promise<LocalSymptom[]> {
    const db = this.getDb();
    const result = (await db.getAllAsync(
      "SELECT * FROM symptoms ORDER BY category, name"
    )) as LocalSymptom[];
    return result;
  }

  async searchSymptoms(query: string): Promise<LocalSymptom[]> {
    const db = this.getDb();
    const searchTerm = `%${query}%`;
    const result = (await db.getAllAsync(
      "SELECT * FROM symptoms WHERE name LIKE ? OR synonyms LIKE ? ORDER BY name",
      [searchTerm, searchTerm]
    )) as LocalSymptom[];
    return result;
  }

  // Favorites operations

  async setFavoriteStatus(params: {
    pointId: string;
    userId: string;
    isFavorite: boolean;
    synced: boolean;
  }): Promise<void> {
    const db = this.getDb();
    const now = new Date().toISOString();

    if (params.isFavorite) {
      await db.runAsync(
        `INSERT INTO favorites (point_id, user_id, synced, operation, created_at, updated_at)
         VALUES (?, ?, ?, ?, COALESCE((SELECT created_at FROM favorites WHERE point_id = ? AND user_id = ?), ?), ?)
         ON CONFLICT(point_id, user_id) DO UPDATE SET
            synced = excluded.synced,
            operation = excluded.operation,
            updated_at = excluded.updated_at`,
        [
          params.pointId,
          params.userId,
          params.synced ? 1 : 0,
          params.synced ? "UPSERT" : "UPSERT",
          params.pointId,
          params.userId,
          now,
          now,
        ]
      );
    } else {
      if (params.synced) {
        await db.runAsync(
          "DELETE FROM favorites WHERE point_id = ? AND user_id = ?",
          [params.pointId, params.userId]
        );
      } else {
        await db.runAsync(
          `INSERT INTO favorites (point_id, user_id, synced, operation, created_at, updated_at)
           VALUES (?, ?, 0, 'DELETE', COALESCE((SELECT created_at FROM favorites WHERE point_id = ? AND user_id = ?), ?), ?)
           ON CONFLICT(point_id, user_id) DO UPDATE SET
             synced = 0,
             operation = 'DELETE',
             updated_at = ?`,
          [
            params.pointId,
            params.userId,
            params.pointId,
            params.userId,
            now,
            now,
            now,
          ]
        );
      }
    }
  }

  async replaceFavorites(userId: string, pointIds: string[]): Promise<void> {
    const db = this.getDb();
    await db.execAsync("BEGIN TRANSACTION");
    try {
      await db.runAsync("DELETE FROM favorites WHERE user_id = ?", [userId]);
      for (const pointId of pointIds) {
        await db.runAsync(
          `INSERT INTO favorites (point_id, user_id, synced, operation, created_at, updated_at)
           VALUES (?, ?, 1, 'UPSERT', ?, ?)`,
          [pointId, userId, new Date().toISOString(), new Date().toISOString()]
        );
      }
      await db.execAsync("COMMIT");
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    const db = this.getDb();
    const result = (await db.getAllAsync(
      `SELECT * FROM favorites WHERE user_id = ? ORDER BY updated_at DESC`,
      [userId]
    )) as Favorite[];
    return result;
  }

  async enqueueFavoriteOperation(
    userId: string,
    pointId: string,
    action: "ADD" | "REMOVE",
    timestamp?: string
  ): Promise<void> {
    const db = this.getDb();
    // Use provided timestamp for conflict resolution, or current time for new operations
    // This ensures all operations have timestamps for proper conflict resolution
    const payload = JSON.stringify({ 
      userId, 
      pointId, 
      action,
      timestamp: timestamp || new Date().toISOString()
    });

    await db.runAsync(
      "DELETE FROM sync_queue WHERE entity = ? AND entity_id = ?",
      ["favorite", `${userId}:${pointId}`]
    );

    await db.runAsync(
      `INSERT INTO sync_queue (entity, entity_id, operation, payload, status, retry_count)
       VALUES ('favorite', ?, ?, ?, 'pending', 0)`,
      [
        `${userId}:${pointId}`,
        action === "ADD" ? "UPSERT" : "DELETE",
        payload,
      ]
    );
  }

  async getPendingOperations(entity?: string, limit = 50): Promise<SyncOperation[]> {
    const db = this.getDb();
    let query =
      "SELECT * FROM sync_queue WHERE status IN ('pending', 'retry') ORDER BY created_at LIMIT ?";
    const params: any[] = [limit];

    if (entity) {
      query =
        "SELECT * FROM sync_queue WHERE entity = ? AND status IN ('pending', 'retry') ORDER BY created_at LIMIT ?";
      params.unshift(entity);
    }

    const result = (await db.getAllAsync(query, params)) as SyncOperation[];
    return result;
  }

  async markOperationInProgress(id: number): Promise<void> {
    const db = this.getDb();
    await db.runAsync(
      `UPDATE sync_queue SET status = 'in_progress', last_attempt = ?, retry_count = retry_count + 1 WHERE id = ?`,
      [new Date().toISOString(), id]
    );
  }

  async markOperationCompleted(id: number): Promise<void> {
    const db = this.getDb();
    await db.runAsync("DELETE FROM sync_queue WHERE id = ?", [id]);
  }

  async markOperationFailed(id: number): Promise<void> {
    const db = this.getDb();
    await db.runAsync(
      `UPDATE sync_queue
       SET status = CASE WHEN retry_count >= ? THEN 'failed' ELSE 'retry' END
       WHERE id = ?`,
      [MAX_QUEUE_RETRIES, id]
    );
  }

  async countPendingOperations(): Promise<number> {
    const db = this.getDb();
    const row = (await db.getFirstAsync(
      "SELECT COUNT(1) AS total FROM sync_queue WHERE status IN ('pending', 'retry', 'in_progress')"
    )) as RawRow | undefined;
    return row ? Number(row.total ?? 0) : 0;
  }

  async removeFavorite(pointId: string, userId: string): Promise<void> {
    const db = this.getDb();
    await db.runAsync("DELETE FROM favorites WHERE point_id = ? AND user_id = ?", [
      pointId,
      userId,
    ]);
  }

  async isFavorite(pointId: string, userId: string): Promise<boolean> {
    const db = this.getDb();
    const result = await db.getFirstAsync(
      "SELECT id FROM favorites WHERE point_id = ? AND user_id = ?",
      [pointId, userId]
    );
    return Boolean(result);
  }

  // Notes operations

  async addNote(
    pointId: string,
    userId: string,
    content: string
  ): Promise<number> {
    const db = this.getDb();
    const result = await db.runAsync(
      "INSERT INTO notes (point_id, user_id, content, synced) VALUES (?, ?, ?, 0)",
      [pointId, userId, content]
    );
    return result.lastInsertRowId;
  }

  async updateNote(id: number, content: string): Promise<void> {
    const db = this.getDb();
    await db.runAsync(
      "UPDATE notes SET content = ?, updated_at = CURRENT_TIMESTAMP, synced = 0 WHERE id = ?",
      [content, id]
    );
  }

  async deleteNote(id: number): Promise<void> {
    const db = this.getDb();
    await db.runAsync("DELETE FROM notes WHERE id = ?", [id]);
  }

  async getNotes(pointId: string, userId: string): Promise<Note[]> {
    const db = this.getDb();
    const result = (await db.getAllAsync(
      "SELECT * FROM notes WHERE point_id = ? AND user_id = ? ORDER BY created_at DESC",
      [pointId, userId]
    )) as Note[];
    return result;
  }

  // Search history operations
  async addSearchHistory(query: string, type: string): Promise<void> {
    const db = this.getDb();
    await db.runAsync(
      "INSERT INTO search_history (query, type) VALUES (?, ?)",
      [query, type]
    );

    await db.runAsync(
      "DELETE FROM search_history WHERE id NOT IN (SELECT id FROM search_history ORDER BY created_at DESC LIMIT 50)"
    );
  }

  async getSearchHistory(type?: string): Promise<SearchHistory[]> {
    const db = this.getDb();
    let query = "SELECT * FROM search_history";
    const params: any[] = [];

    if (type) {
      query += " WHERE type = ?";
      params.push(type);
    }

    query += " ORDER BY created_at DESC LIMIT 10";

    const result = (await db.getAllAsync(query, params)) as SearchHistory[];
    return result;
  }

  // Sync status helpers

  async updateSyncStatus(tableName: string, status: string): Promise<void> {
    const db = this.getDb();
    await db.runAsync(
      `INSERT INTO sync_status (table_name, last_sync, status)
       VALUES (?, ?, ?)
       ON CONFLICT(table_name) DO UPDATE SET
         last_sync = excluded.last_sync,
         status = excluded.status`,
      [tableName, new Date().toISOString(), status]
    );
  }

  async getLastSync(tableName: string): Promise<string | null> {
    const db = this.getDb();
    const row = await db.getFirstAsync(
      "SELECT last_sync FROM sync_status WHERE table_name = ?",
      [tableName]
    );
    return row ? (row as any).last_sync : null;
  }

  async clearAllData(): Promise<void> {
    const db = this.getDb();
    const tables = [
      "points",
      "symptoms",
      "symptom_points",
      "favorites",
      "notes",
      "search_history",
      "sync_status",
      "sync_queue",
      "image_sync_queue",
    ];
    await db.execAsync("BEGIN TRANSACTION");
    try {
      for (const table of tables) {
        await db.runAsync(`DELETE FROM ${table}`);
      }
      await db.execAsync("COMMIT");
    } catch (error) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  }

  // Image sync queue operations

  async enqueueImageSync(pointId: string, imageUri: string): Promise<void> {
    const db = this.getDb();
    const payload = JSON.stringify({ pointId, imageUri });

    await db.runAsync(
      "DELETE FROM image_sync_queue WHERE point_id = ?",
      [pointId]
    );

    await db.runAsync(
      `INSERT INTO image_sync_queue (point_id, image_uri, payload, status, retry_count)
       VALUES (?, ?, ?, 'pending', 0)`,
      [pointId, imageUri, payload]
    );
  }

  async getPendingImages(limit = 50): Promise<ImageSyncOperation[]> {
    const db = this.getDb();
    const result = (await db.getAllAsync(
      "SELECT * FROM image_sync_queue WHERE status IN ('pending', 'retry') ORDER BY created_at LIMIT ?",
      [limit]
    )) as ImageSyncOperation[];
    return result;
  }

  async markImageSyncInProgress(id: number): Promise<void> {
    const db = this.getDb();
    await db.runAsync(
      `UPDATE image_sync_queue SET status = 'in_progress', last_attempt = ?, retry_count = retry_count + 1 WHERE id = ?`,
      [new Date().toISOString(), id]
    );
  }

  async markImageSyncCompleted(id: number): Promise<void> {
    const db = this.getDb();
    await db.runAsync("DELETE FROM image_sync_queue WHERE id = ?", [id]);
  }

  async markImageSyncFailed(id: number): Promise<void> {
    const db = this.getDb();
    await db.runAsync(
      `UPDATE image_sync_queue
       SET status = CASE WHEN retry_count >= ? THEN 'failed' ELSE 'retry' END
       WHERE id = ?`,
      [MAX_QUEUE_RETRIES, id]
    );
  }

  async countPendingImages(): Promise<number> {
    const db = this.getDb();
    const row = (await db.getFirstAsync(
      "SELECT COUNT(1) AS total FROM image_sync_queue WHERE status IN ('pending', 'retry', 'in_progress')"
    )) as RawRow | undefined;
    return row ? Number(row.total ?? 0) : 0;
  }
}

export const databaseService = new DatabaseService();
