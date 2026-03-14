const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    createCase,
    getMyCases,
    getCaseById
} = require("../controllers/caseController");

// Admin creates case
router.post("/", protect, authorize("admin"), createCase);

// Logged in users get their own cases
router.get("/", protect, getMyCases);

// Get specific case securely
router.get("/:id", protect, getCaseById);

module.exports = router;