const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getLogs } = require("../controllers/adminController");

// Only ADMIN can access logs
router.get("/logs", protect, authorize("admin"), getLogs);

module.exports = router;