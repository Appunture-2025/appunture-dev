const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(["admin"]));

// Dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);

// Points management
router.post("/points", adminController.createPoint);
router.put("/points/:id", adminController.updatePoint);
router.delete("/points/:id", adminController.deletePoint);

// Symptoms management
router.post("/symptoms", adminController.createSymptom);
router.put("/symptoms/:id", adminController.updateSymptom);
router.delete("/symptoms/:id", adminController.deleteSymptom);

// Link/Unlink symptoms to points
router.post(
  "/symptoms/:symptomId/points/:pointId",
  adminController.linkSymptomToPoint
);
router.delete(
  "/symptoms/:symptomId/points/:pointId",
  adminController.unlinkSymptomFromPoint
);

// File upload
router.post("/upload", upload.single("file"), adminController.uploadFile);

// User management
router.get("/users", adminController.getAllUsers);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
