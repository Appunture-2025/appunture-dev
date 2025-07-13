const Point = require("../models/Point");

const pointsController = {
  async getAll(req, res) {
    try {
      const { limit = 50, offset = 0, meridian } = req.query;

      let points;
      if (meridian) {
        points = await Point.getByMeridian(meridian);
      } else {
        points = await Point.getAll(parseInt(limit), parseInt(offset));
      }

      res.json({
        points,
        count: points.length,
      });
    } catch (error) {
      console.error("Get points error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const point = await Point.getWithSymptoms(id);

      if (!point) {
        return res.status(404).json({ error: "Point not found" });
      }

      res.json({ point });
    } catch (error) {
      console.error("Get point error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async search(req, res) {
    try {
      const { q: searchTerm } = req.query;

      if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
      }

      const points = await Point.search(searchTerm);

      res.json({
        points,
        count: points.length,
        searchTerm,
      });
    } catch (error) {
      console.error("Search points error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getBySymptom(req, res) {
    try {
      const { symptomId } = req.params;
      const points = await Point.getBySymptom(symptomId);

      res.json({
        points,
        count: points.length,
      });
    } catch (error) {
      console.error("Get points by symptom error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getMeridians(req, res) {
    try {
      const query = `
        SELECT DISTINCT meridian, COUNT(*) as point_count
        FROM points 
        GROUP BY meridian 
        ORDER BY meridian
      `;

      const db = require("../config/database");
      const result = await db.query(query);

      res.json({
        meridians: result.rows,
      });
    } catch (error) {
      console.error("Get meridians error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = pointsController;
