const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

// Any logged-in user
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        message: "Profile accessed successfully",
        user: req.user
    });
});

// Only admin
router.get("/admin-dashboard", protect, authorize("admin"), (req, res) => {
    res.status(200).json({
        message: "Welcome Admin"
    });
});

// Only lawyer
router.get("/lawyer-dashboard", protect, authorize("lawyer"), (req, res) => {
    res.status(200).json({
        message: "Welcome Lawyer"
    });
});

// Only client
router.get("/client-dashboard", protect, authorize("client"), (req, res) => {
    res.status(200).json({
        message: "Welcome Client"
    });
});

module.exports = router;