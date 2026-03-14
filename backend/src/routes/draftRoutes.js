const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateDraftDocument } = require("../controllers/draftController");

router.post("/", protect, generateDraftDocument);

module.exports = router;