const db = require("../config/database");

class Point {
  static async create(pointData) {
    const {
      code,
      name,
      chinese_name,
      meridian,
      location,
      indications,
      contraindications,
      coordinates,
      image_url,
    } = pointData;

    const query = `
      INSERT INTO points (code, name, chinese_name, meridian, location, indications, contraindications, coordinates, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await db.query(query, [
      code,
      name,
      chinese_name,
      meridian,
      location,
      indications,
      contraindications,
      coordinates,
      image_url,
    ]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = "SELECT * FROM points WHERE id = $1";
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByCode(code) {
    const query = "SELECT * FROM points WHERE code = $1";
    const result = await db.query(query, [code]);
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM points 
      ORDER BY meridian, code 
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  }

  static async getByMeridian(meridian) {
    const query = "SELECT * FROM points WHERE meridian = $1 ORDER BY code";
    const result = await db.query(query, [meridian]);
    return result.rows;
  }

  static async search(searchTerm) {
    const query = `
      SELECT * FROM points 
      WHERE 
        name ILIKE $1 OR 
        chinese_name ILIKE $1 OR 
        code ILIKE $1 OR 
        meridian ILIKE $1 OR 
        location ILIKE $1 OR 
        indications ILIKE $1
      ORDER BY 
        CASE 
          WHEN name ILIKE $1 THEN 1
          WHEN code ILIKE $1 THEN 2
          WHEN meridian ILIKE $1 THEN 3
          ELSE 4
        END
    `;
    const result = await db.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }

  static async update(id, pointData) {
    const {
      code,
      name,
      chinese_name,
      meridian,
      location,
      indications,
      contraindications,
      coordinates,
      image_url,
    } = pointData;

    const query = `
      UPDATE points 
      SET code = $1, name = $2, chinese_name = $3, meridian = $4, 
          location = $5, indications = $6, contraindications = $7,
          coordinates = $8, image_url = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;

    const result = await db.query(query, [
      code,
      name,
      chinese_name,
      meridian,
      location,
      indications,
      contraindications,
      coordinates,
      image_url,
      id,
    ]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM points WHERE id = $1 RETURNING *";
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getWithSymptoms(pointId) {
    const query = `
      SELECT p.*, 
             json_agg(
               json_build_object(
                 'id', s.id,
                 'name', s.name,
                 'description', s.description,
                 'category', s.category,
                 'efficacy_score', ps.efficacy_score
               )
             ) as symptoms
      FROM points p
      LEFT JOIN point_symptoms ps ON p.id = ps.point_id
      LEFT JOIN symptoms s ON ps.symptom_id = s.id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const result = await db.query(query, [pointId]);
    return result.rows[0];
  }

  static async getBySymptom(symptomId) {
    const query = `
      SELECT p.*, ps.efficacy_score
      FROM points p
      JOIN point_symptoms ps ON p.id = ps.point_id
      WHERE ps.symptom_id = $1
      ORDER BY ps.efficacy_score DESC
    `;

    const result = await db.query(query, [symptomId]);
    return result.rows;
  }
}

module.exports = Point;
