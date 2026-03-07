const pdf = require("pdf-parse");
const Document = require("../models/Document");
const Case = require("../models/Case");

const {
    encryptText,
    decryptText,
    generateHash
} = require("../utils/encryption");

const { generateSummary } = require("../utils/summarizer");
const { createTfIdfVector } = require("../utils/embeddings");
const { chunkDocument, rankChunks } = require("../utils/similarity");
// ==================================================
// Upload Document (Secure)
// ==================================================
exports.uploadDocument = async (req, res, next) => {
    try {
        const { caseId } = req.params;

        const caseData = await Case.findById(caseId);

        if (!caseData) {
            return res.status(404).json({
                message: "Associated case not found"
            });
        }

        // Only admin or assigned lawyer can upload
        if (
            req.user.role !== "admin" &&
            caseData.assignedLawyer.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Not authorized to upload document for this case"
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Extract text from PDF
        const pdfData = await pdf(req.file.buffer);
        const extractedText = pdfData.text?.trim();

        if (!extractedText) {
            return res.status(400).json({
                message: "Unable to extract text from PDF"
            });
        }

        // Encrypt extracted text
        const { encryptedData, iv } = encryptText(extractedText);

        // Generate SHA256 hash of original decrypted text
        const sha256Hash = generateHash(extractedText);

        const document = await Document.create({
            caseId,
            encryptedText: encryptedData,
            iv,
            sha256Hash,
            uploadedBy: req.user._id
        });

        res.status(201).json({
            message: "Document uploaded securely",
            documentId: document._id
        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// Get Document Securely
// ==================================================
exports.getDocument = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const caseData = await Case.findById(document.caseId);

        if (!caseData) {
            return res.status(404).json({ message: "Associated case not found" });
        }

        // Ownership enforcement
        if (
            req.user.role !== "admin" &&
            caseData.assignedLawyer.toString() !== req.user._id.toString() &&
            caseData.client.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Unauthorized to access this document"
            });
        }

        // Decrypt text
        const decryptedText = decryptText(
            document.encryptedText,
            document.iv
        );

        if (!decryptedText) {
            return res.status(500).json({
                message: "Decryption failed"
            });
        }

        // Integrity verification
        const recalculatedHash = generateHash(decryptedText);

        if (recalculatedHash !== document.sha256Hash) {
            return res.status(400).json({
                message: "Document integrity compromised"
            });
        }

        res.status(200).json({
            message: "Document retrieved securely",
            content: decryptedText
        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// Generate Secure Summary
// ==================================================
exports.generateDocumentSummary = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const caseData = await Case.findById(document.caseId);

        if (!caseData) {
            return res.status(404).json({
                message: "Associated case not found"
            });
        }

        // Ownership enforcement
        if (
            req.user.role !== "admin" &&
            caseData.assignedLawyer.toString() !== req.user._id.toString() &&
            caseData.client.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Unauthorized to summarize this document"
            });
        }

        // Decrypt text
        const decryptedText = decryptText(
            document.encryptedText,
            document.iv
        );

        if (!decryptedText) {
            return res.status(500).json({
                message: "Decryption failed"
            });
        }

        // Integrity verification
        const recalculatedHash = generateHash(decryptedText);

        if (recalculatedHash !== document.sha256Hash) {
            return res.status(400).json({
                message: "Document integrity compromised"
            });
        }

        // Generate summary
        const summary = generateSummary(decryptedText);

        res.status(200).json({
            message: "Summary generated securely",
            summary
        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// Secure Semantic Q&A
// ==================================================

exports.askDocumentQuestion = async (req, res, next) => {
    try {
        const { question } = req.body;

        if (!question || typeof question !== "string" || question.length < 5) {
            return res.status(400).json({
                message: "Invalid or empty question"
            });
        }

        if (question.length > 300) {
            return res.status(400).json({
                message: "Question too long"
            });
        }

        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const caseData = await Case.findById(document.caseId);

        if (!caseData) {
            return res.status(404).json({
                message: "Associated case not found"
            });
        }

        // Ownership enforcement
        if (
            req.user.role !== "admin" &&
            caseData.assignedLawyer.toString() !== req.user._id.toString() &&
            caseData.client.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Unauthorized to query this document"
            });
        }

        // Decrypt
        const decryptedText = decryptText(
            document.encryptedText,
            document.iv
        );

        if (!decryptedText) {
            return res.status(500).json({
                message: "Decryption failed"
            });
        }

        // Integrity verification
        const recalculatedHash = generateHash(decryptedText);

        if (recalculatedHash !== document.sha256Hash) {
            return res.status(400).json({
                message: "Document integrity compromised"
            });
        }

        // ---- Semantic Retrieval ----
        const chunks = chunkDocument(decryptedText);
        const tfidf = createTfIdfVector(chunks);

        const ranked = rankChunks(tfidf, question, chunks, 3);

        const answer = ranked.map(r => r.text).join(" ");

        res.status(200).json({
            message: "Answer generated securely",
            question,
            answer
        });

    } catch (error) {
        next(error);
    }
};