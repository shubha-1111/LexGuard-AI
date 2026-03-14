const Document = require("../models/Document");
const { decryptText, generateHash } = require("../utils/encryption");
const { analyzeDocumentRisk } = require("../utils/riskAnalyzer");

exports.analyzeDocument = async (req, res, next) => {

    try {

        const { documentId } = req.body;

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                message: "Document not found"
            });
        }

        const decryptedText = decryptText(
            document.encryptedText,
            document.iv
        );

        const recalculatedHash = generateHash(decryptedText);

        if (recalculatedHash !== document.sha256Hash) {
            return res.status(400).json({
                message: "Document integrity compromised"
            });
        }

        const result = analyzeDocumentRisk(decryptedText);

        res.status(200).json({
            message: "Risk analysis completed",
            result
        });

    } catch (error) {
        next(error);
    }

};