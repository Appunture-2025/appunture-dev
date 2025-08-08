const db = require("../config/database");

class Symptom {
  static async create(symptomData) {
    const { name, description, category } = symptomData;

    const query = `
      INSERT INTO symptoms (name, description, category)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await db.query(query, [name, description, category]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = "SELECT * FROM symptoms WHERE id = $1";
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getAll() {
    const query = "SELECT * FROM symptoms ORDER BY category, name";
    const result = await db.query(query);
    return result.rows;
  }

  static async getByCategory(category) {
    const query = "SELECT * FROM symptoms WHERE category = $1 ORDER BY name";
    const result = await db.query(query, [category]);
    return result.rows;
  }

  static async search(searchTerm) {
    const query = `
      SELECT * FROM symptoms 
      WHERE 
        name ILIKE $1 OR 
        description ILIKE $1 OR 
        category ILIKE $1
      ORDER BY name
    `;
    const result = await db.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }

  static async update(id, symptomData) {
    const { name, description, category } = symptomData;

    const query = `
      UPDATE symptoms 
      SET name = $1, description = $2, category = $3
      WHERE id = $4
      RETURNING *
    `;

    const result = await db.query(query, [name, description, category, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = "DELETE FROM symptoms WHERE id = $1 RETURNING *";
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async linkToPoint(symptomId, pointId, efficacyScore = 5) {
    const query = `
      INSERT INTO point_symptoms (symptom_id, point_id, efficacy_score)
      VALUES ($1, $2, $3)
      ON CONFLICT (symptom_id, point_id) 
      DO UPDATE SET efficacy_score = $3
      RETURNING *
    `;

    const result = await db.query(query, [symptomId, pointId, efficacyScore]);
    return result.rows[0];
  }

  static async unlinkFromPoint(symptomId, pointId) {
    const query =
      "DELETE FROM point_symptoms WHERE symptom_id = $1 AND point_id = $2 RETURNING *";
    const result = await db.query(query, [symptomId, pointId]);
    return result.rows[0];
  }

  static async getWithPoints(symptomId) {
    const query = `
      SELECT s.*, 
             json_agg(
               json_build_object(
                 'id', p.id,
                 'code', p.code,
                 'name', p.name,
                 'chinese_name', p.chinese_name,
                 'meridian', p.meridian,
                 'efficacy_score', ps.efficacy_score
               )
             ) as points
      FROM symptoms s
      LEFT JOIN point_symptoms ps ON s.id = ps.symptom_id
      LEFT JOIN points p ON ps.point_id = p.id
      WHERE s.id = $1
      GROUP BY s.id
    `;

    const result = await db.query(query, [symptomId]);
    return result.rows[0];
  }
}

module.exports = Symptom;
