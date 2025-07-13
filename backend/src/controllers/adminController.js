const Point = require("../models/Point");
const Symptom = require("../models/Symptom");
const User = require("../models/User");
const upload = require("../middleware/upload");

const adminController = {
  // Points management
  async createPoint(req, res) {
    try {
      const pointData = req.body;

      // Validate required fields
      if (
        !pointData.code ||
        !pointData.name ||
        !pointData.meridian ||
        !pointData.location
      ) {
        return res.status(400).json({
          error: "Code, name, meridian, and location are required",
        });
      }

      // Check if point code already exists
      const existingPoint = await Point.findByCode(pointData.code);
      if (existingPoint) {
        return res.status(400).json({
          error: "Point with this code already exists",
        });
      }

      // Parse coordinates if provided as string
      if (pointData.coordinates && typeof pointData.coordinates === "string") {
        try {
          pointData.coordinates = JSON.parse(pointData.coordinates);
        } catch (e) {
          return res.status(400).json({ error: "Invalid coordinates format" });
        }
      }

      const point = await Point.create(pointData);
      res.status(201).json({
        message: "Point created successfully",
        point,
      });
    } catch (error) {
      console.error("Create point error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async updatePoint(req, res) {
    try {
      const { id } = req.params;
      const pointData = req.body;

      // Parse coordinates if provided as string
      if (pointData.coordinates && typeof pointData.coordinates === "string") {
        try {
          pointData.coordinates = JSON.parse(pointData.coordinates);
        } catch (e) {
          return res.status(400).json({ error: "Invalid coordinates format" });
        }
      }

      const point = await Point.update(id, pointData);
      if (!point) {
        return res.status(404).json({ error: "Point not found" });
      }

      res.json({
        message: "Point updated successfully",
        point,
      });
    } catch (error) {
      console.error("Update point error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async deletePoint(req, res) {
    try {
      const { id } = req.params;

      const point = await Point.delete(id);
      if (!point) {
        return res.status(404).json({ error: "Point not found" });
      }

      res.json({
        message: "Point deleted successfully",
        point,
      });
    } catch (error) {
      console.error("Delete point error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Symptoms management
  async createSymptom(req, res) {
    try {
      const symptomData = req.body;

      if (!symptomData.name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const symptom = await Symptom.create(symptomData);
      res.status(201).json({
        message: "Symptom created successfully",
        symptom,
      });
    } catch (error) {
      console.error("Create symptom error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async updateSymptom(req, res) {
    try {
      const { id } = req.params;
      const symptomData = req.body;

      const symptom = await Symptom.update(id, symptomData);
      if (!symptom) {
        return res.status(404).json({ error: "Symptom not found" });
      }

      res.json({
        message: "Symptom updated successfully",
        symptom,
      });
    } catch (error) {
      console.error("Update symptom error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async deleteSymptom(req, res) {
    try {
      const { id } = req.params;

      const symptom = await Symptom.delete(id);
      if (!symptom) {
        return res.status(404).json({ error: "Symptom not found" });
      }

      res.json({
        message: "Symptom deleted successfully",
        symptom,
      });
    } catch (error) {
      console.error("Delete symptom error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Link/Unlink symptoms to points
  async linkSymptomToPoint(req, res) {
    try {
      const { symptomId, pointId } = req.params;
      const { efficacyScore = 5 } = req.body;

      const link = await Symptom.linkToPoint(symptomId, pointId, efficacyScore);
      res.json({
        message: "Symptom linked to point successfully",
        link,
      });
    } catch (error) {
      console.error("Link symptom to point error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async unlinkSymptomFromPoint(req, res) {
    try {
      const { symptomId, pointId } = req.params;

      const link = await Symptom.unlinkFromPoint(symptomId, pointId);
      if (!link) {
        return res.status(404).json({ error: "Link not found" });
      }

      res.json({
        message: "Symptom unlinked from point successfully",
        link,
      });
    } catch (error) {
      console.error("Unlink symptom from point error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // File upload
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        message: "File uploaded successfully",
        fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Upload file error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // User management
  async getAllUsers(req, res) {
    try {
      const users = await User.getAll();
      res.json({
        users,
        count: users.length,
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (parseInt(id) === req.user.id) {
        return res
          .status(400)
          .json({ error: "Cannot delete your own account" });
      }

      const user = await User.delete(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "User deleted successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Dashboard stats
  async getDashboardStats(req, res) {
    try {
      const db = require("../config/database");

      const [pointsCount, symptomsCount, usersCount] = await Promise.all([
        db.query("SELECT COUNT(*) FROM points"),
        db.query("SELECT COUNT(*) FROM symptoms"),
        db.query("SELECT COUNT(*) FROM users"),
      ]);

      res.json({
        stats: {
          totalPoints: parseInt(pointsCount.rows[0].count),
          totalSymptoms: parseInt(symptomsCount.rows[0].count),
          totalUsers: parseInt(usersCount.rows[0].count),
        },
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = adminController;
