const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const { legalResearchQuery } = require("../controllers/legalResearchController");

router.post("/query",legalResearchQuery);
module.exports = router;