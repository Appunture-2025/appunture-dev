const db = require("../config/database");

class User {
  static async create(userData) {
    const { email, password_hash, name, profession, role = "user" } = userData;

    const query = `
      INSERT INTO users (email, password_hash, name, profession, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, profession, role, created_at
    `;

    const result = await db.query(query, [
      email,
      password_hash,
      name,
      profession,
      role,
    ]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query =
      "SELECT id, email, name, profession, role, created_at FROM users WHERE id = $1";
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, userData) {
    const { name, profession } = userData;
    const query = `
      UPDATE users 
      SET name = $1, profession = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, email, name, profession, role, created_at, updated_at
    `;

    const result = await db.query(query, [name, profession, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM users WHERE id = $1 RETURNING *";
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getAll() {
    const query =
      "SELECT id, email, name, profession, role, created_at FROM users ORDER BY created_at DESC";
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = User;
