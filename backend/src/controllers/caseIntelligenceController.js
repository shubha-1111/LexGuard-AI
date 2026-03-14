const Case = require("../models/Case");
const Document = require("../models/Document");
const Precedent = require("../models/Precedent");

const { decryptText, generateHash } = require("../utils/encryption");
const { generateSummary } = require("../utils/summarizer");
const { createTfIdfVector } = require("../utils/embeddings");
const { chunkDocument, rankChunks } = require("../utils/similarity");
const { extractTimeline } = require("../utils/timelineExtractor");
const { extractLegalSections } = require("../utils/legalSectionExtractor");
const { searchPrecedents } = require("../utils/precedentSearch");
const { analyzeCaseFacts } = require("../utils/caseAnalyzer");


// =====================
// CASE LEVEL SUMMARY
// =====================
exports.getCaseSummary = async (req, res, next) => {
    try {
        const caseId = req.params.caseId;

        const caseData = await Case.findById(caseId);
        if (!caseData) {
            return res.status(404).json({ message: "Case not found" });
        }

        if (
            req.user.role !== "admin" &&
            caseData.assignedLawyer.toString() !== req.user._id.toString() &&
            caseData.client.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const documents = await Document.find({ caseId });

        if (!documents.length) {
            return res.status(400).json({ message: "No documents found for this case" });
        }

        let combinedText = "";

        for (let doc of documents) {
            const decryptedText = decryptText(doc.encryptedText, doc.iv);

            const recalculatedHash = generateHash(decryptedText);
            if (recalculatedHash !== doc.sha256Hash) {
                return res.status(400).json({
                    message: "Document integrity compromised"
                });
            }

            combinedText += decryptedText + "\n\n";
        }

        const summary = generateSummary(combinedText);

        res.status(200).json({
            message: "Case summary generated",
            summary
        });

    } catch (error) {
        next(error);
    }
};


// =====================
// CASE LEVEL Q&A
// =====================
exports.askCaseQuestion = async (req, res, next) => {
    try {
        const { question } = req.body;
        const caseId = req.params.caseId;

        if (!question || question.length < 5) {
            return res.status(400).json({ message: "Invalid question" });
        }

        const caseData = await Case.findById(caseId);
        if (!caseData) {
            return res.status(404).json({ message: "Case not found" });
        }

        if (
            req.user.role !== "admin" &&
            caseData.assignedLawyer.toString() !== req.user._id.toString() &&
            caseData.client.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const documents = await Document.find({ caseId });

        if (!documents.length) {
            return res.status(400).json({ message: "No documents found" });
        }

        let combinedText = "";

        for (let doc of documents) {
            const decryptedText = decryptText(doc.encryptedText, doc.iv);

            const recalculatedHash = generateHash(decryptedText);
            if (recalculatedHash !== doc.sha256Hash) {
                return res.status(400).json({
                    message: "Document integrity compromised"
                });
            }

            combinedText += decryptedText + "\n\n";
        }

        const chunks = chunkDocument(combinedText);
        const tfidf = createTfIdfVector(chunks);
        const ranked = rankChunks(tfidf, question, chunks, 5);

        const answer = ranked.map(r => r.text).join(" ");

        res.status(200).json({
            message: "Case answer generated",
            question,
            answer
        });

    } catch (error) {
        next(error);
    }
};


// =====================
// CASE TIMELINE
// =====================
exports.getCaseTimeline = async (req, res, next) => {
    try {
        const caseId = req.params.caseId;

        const caseData = await Case.findById(caseId);
        if (!caseData) {
            return res.status(404).json({ message: "Case not found" });
        }

        const documents = await Document.find({ caseId });

        if (!documents.length) {
            return res.status(400).json({ message: "No documents found" });
        }

        let combinedText = "";

        for (let doc of documents) {
            const decryptedText = decryptText(doc.encryptedText, doc.iv);

            const recalculatedHash = generateHash(decryptedText);
            if (recalculatedHash !== doc.sha256Hash) {
                return res.status(400).json({
                    message: "Document integrity compromised"
                });
            }

            combinedText += decryptedText + "\n\n";
        }

        const timeline = extractTimeline(combinedText);

        res.status(200).json({
            message: "Case timeline generated",
            count: timeline.length,
            timeline
        });

    } catch (error) {
        next(error);
    }
};


// =====================
// CASE LEGAL SECTIONS
// =====================
exports.getCaseLegalSections = async (req, res, next) => {
    try {
        const caseId = req.params.caseId;

        const documents = await Document.find({ caseId });

        let combinedText = "";

        for (let doc of documents) {
            const decryptedText = decryptText(doc.encryptedText, doc.iv);
            combinedText += decryptedText + "\n\n";
        }

        const sections = extractLegalSections(combinedText);

        res.status(200).json({
            message: "Legal sections extracted",
            sections
        });

    } catch (error) {
        next(error);
    }
};


// =====================
// AI CASE ANALYSIS
// =====================
exports.analyzeCase = async (req, res, next) => {

    try {

        const { facts } = req.body;

        const analysis = analyzeCaseFacts(facts);

        const precedents = await Precedent.find();

        const decryptedDocs = precedents.map(p => {

            const text = decryptText(p.encryptedText, p.iv);

            return {
                id: p._id,
                title: p.title,
                text
            };

        });

        const results = searchPrecedents(facts, decryptedDocs);

        res.json({
            success: true,
            facts,
            analysis,
            recommendedPrecedents: results
        });

    } catch (err) {
        next(err);
    }

};