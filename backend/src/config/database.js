const { Pool } = require("pg");
const path = require("path");

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// SQLite connection for local development/testing
const sqlite3 = require("sqlite3").verbose();
const dbPath = path.join(__dirname, "..", "..", "database", "appunture.db");

const sqlite = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening SQLite database:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Database helper functions
const db = {
  // PostgreSQL queries
  query: (text, params) => pool.query(text, params),

  // SQLite queries
  sqliteQuery: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqlite.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Initialize database tables
  initTables: async () => {
    try {
      // Users table
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          profession VARCHAR(100),
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Points table
      await db.query(`
        CREATE TABLE IF NOT EXISTS points (
          id SERIAL PRIMARY KEY,
          code VARCHAR(20) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          chinese_name VARCHAR(255),
          meridian VARCHAR(100) NOT NULL,
          location TEXT NOT NULL,
          indications TEXT,
          contraindications TEXT,
          coordinates JSONB,
          image_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Symptoms table
      await db.query(`
        CREATE TABLE IF NOT EXISTS symptoms (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Point-Symptom relationship table
      await db.query(`
        CREATE TABLE IF NOT EXISTS point_symptoms (
          id SERIAL PRIMARY KEY,
          point_id INTEGER REFERENCES points(id) ON DELETE CASCADE,
          symptom_id INTEGER REFERENCES symptoms(id) ON DELETE CASCADE,
          efficacy_score INTEGER DEFAULT 5,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User favorites table
      await db.query(`
        CREATE TABLE IF NOT EXISTS user_favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          point_id INTEGER REFERENCES points(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, point_id)
        )
      `);

      console.log("Database tables initialized");
    } catch (error) {
      console.error("Error initializing database tables:", error);
    }
  },

  pool,
  sqlite,
};

module.exports = db;
