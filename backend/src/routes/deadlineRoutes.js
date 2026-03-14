const express = require("express");
const router = express.Router();

const deadlineController = require("../controllers/deadlineController");

const { protect } = require("../middleware/authMiddleware");

router.post("/extract", protect, deadlineController.extractDeadlinesFromDocument);

router.get("/upcoming", protect, deadlineController.getUpcomingDeadlines);

router.get("/case/:caseId", protect, deadlineController.getCaseDeadlines);

router.put("/complete/:id", protect, deadlineController.completeDeadline);

module.exports = router;