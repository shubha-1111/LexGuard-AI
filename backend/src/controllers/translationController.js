const Document = require("../models/Document");
const { decryptText, generateHash } = require("../utils/encryption");
const { translateText } = require("../utils/translator");
const { cleanExtractedText } = require("../utils/textCleaner");


exports.translateDocument = async (req, res, next) => {
    try {

        const { documentId, targetLanguage } = req.body;

        if (!documentId || !targetLanguage) {
            return res.status(400).json({
                success: false,
                message: "documentId and targetLanguage required"
            });
        }

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // decrypt
        const decryptedText = decryptText(
            document.encryptedText,
            document.iv
        );

        // verify integrity
        const recalculatedHash = generateHash(decryptedText);

        if (recalculatedHash !== document.sha256Hash) {
            return res.status(400).json({
                success: false,
                message: "Document integrity compromised"
            });
        }

        // clean text
        const cleanedText = cleanExtractedText(decryptedText);
        console.log("DECRYPTED LENGTH:", decryptedText.length);
        console.log("CLEANED LENGTH:", cleanedText.length);
        console.log("CLEANED SAMPLE:", cleanedText.substring(0,200));   
        // translate
        const translated = await translateText(
            cleanedText,
            targetLanguage
        );

        res.status(200).json({
            success: true,
            message: "Translation successful",
            translatedText: translated
        });
     

        console.log("DECRYPTED:", decryptedText.substring(0,200));
        console.log("CLEANED:", cleanedText.substring(0,200));

    } catch (error) {

        console.error("TRANSLATION ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Translation failed"
        });
    }
};