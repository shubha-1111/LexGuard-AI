const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const { 
    uploadDocument, 
    getDocument, 
    generateDocumentSummary,
    askDocumentQuestion
} = require("../controllers/documentController");

const multer = require("multer");

// Multer config (memory storage)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            cb(new Error("Only PDF files are allowed"), false);
        } else {
            cb(null, true);
        }
    }
});

// Upload document
router.post("/:caseId", protect, upload.single("file"), uploadDocument);

// Get document
router.get("/:id", protect, getDocument);

// Get summary
router.get("/:id/summary", protect, generateDocumentSummary);
module.exports = router;

router.post("/:id/ask", protect, askDocumentQuestion);