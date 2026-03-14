const express = require("express");
const router = express.Router();

const { askLegalAI } = require("../controllers/legalChatController");

router.post("/legal-chat",askLegalAI);

module.exports = router;