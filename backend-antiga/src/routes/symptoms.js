const express = require("express");
const router = express.Router();
const symptomsController = require("../controllers/symptomsController");
const { authenticateToken } = require("../middleware/auth");

// Public routes
router.get("/", symptomsController.getAll);
router.get("/search", symptomsController.search);
router.get("/categories", symptomsController.getCategories);
router.get("/:id", symptomsController.getById);

module.exports = router;
