const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { analyzeCase } = require("../controllers/caseIntelligenceController");
const {
    getCaseSummary,
    askCaseQuestion,
    getCaseTimeline,
    getCaseLegalSections
} = require("../controllers/caseIntelligenceController");
router.get("/:caseId/legal-sections", protect, getCaseLegalSections);


router.get("/:caseId/timeline", protect, getCaseTimeline);
router.get("/:caseId/summary", protect, getCaseSummary);
router.post("/:caseId/ask", protect, askCaseQuestion);
router.post("/analyze",analyzeCase);
module.exports = router;