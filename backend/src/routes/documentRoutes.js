const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    uploadDocument,
    getDocument,
    generateDocumentSummary,
    askDocumentQuestion,
    getDocumentsByCase
} = require("../controllers/documentController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            cb(new Error("Only PDF files are allowed"), false);
        } else {
            cb(null, true);
        }
    }
});

router.post("/:caseId", protect, upload.single("file"), uploadDocument);
router.get("/case/:caseId", protect, getDocumentsByCase);
router.get("/:id/summary", protect, generateDocumentSummary);
router.post("/:id/ask", protect, askDocumentQuestion);
router.get("/:id", protect, getDocument);

module.exports = router;