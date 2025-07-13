const Symptom = require("../models/Symptom");

const symptomsController = {
  async getAll(req, res) {
    try {
      const { category } = req.query;

      let symptoms;
      if (category) {
        symptoms = await Symptom.getByCategory(category);
      } else {
        symptoms = await Symptom.getAll();
      }

      res.json({
        symptoms,
        count: symptoms.length,
      });
    } catch (error) {
      console.error("Get symptoms error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const symptom = await Symptom.getWithPoints(id);

      if (!symptom) {
        return res.status(404).json({ error: "Symptom not found" });
      }

      res.json({ symptom });
    } catch (error) {
      console.error("Get symptom error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async search(req, res) {
    try {
      const { q: searchTerm } = req.query;

      if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
      }

      const symptoms = await Symptom.search(searchTerm);

      res.json({
        symptoms,
        count: symptoms.length,
        searchTerm,
      });
    } catch (error) {
      console.error("Search symptoms error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getCategories(req, res) {
    try {
      const query = `
        SELECT DISTINCT category, COUNT(*) as symptom_count
        FROM symptoms 
        WHERE category IS NOT NULL
        GROUP BY category 
        ORDER BY category
      `;

      const db = require("../config/database");
      const result = await db.query(query);

      res.json({
        categories: result.rows,
      });
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = symptomsController;
