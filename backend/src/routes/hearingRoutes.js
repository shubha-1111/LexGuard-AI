const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    addHearing,
    getUpcomingHearings,
    getPastHearings
} = require("../controllers/hearingController");

router.post("/", protect, addHearing);
router.get("/upcoming", protect, getUpcomingHearings);
router.get("/past", protect, getPastHearings);

module.exports = router;