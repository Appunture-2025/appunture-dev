const express = require("express");
const router = express.Router();
const pointsController = require("../controllers/pointsController");
const { authenticateToken } = require("../middleware/auth");

// Public routes (can be accessed without authentication)
router.get("/", pointsController.getAll);
router.get("/search", pointsController.search);
router.get("/meridians", pointsController.getMeridians);
router.get("/symptom/:symptomId", pointsController.getBySymptom);
router.get("/:id", pointsController.getById);

// Protected routes (require authentication)
// router.get('/favorites', authenticateToken, pointsController.getFavorites);
// router.post('/favorites/:id', authenticateToken, pointsController.addToFavorites);
// router.delete('/favorites/:id', authenticateToken, pointsController.removeFromFavorites);

module.exports = router;
