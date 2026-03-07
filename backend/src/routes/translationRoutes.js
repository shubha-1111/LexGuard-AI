const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const { translateDocument } = require("../controllers/translationController");

router.post("/", protect, translateDocument);

module.exports = router;