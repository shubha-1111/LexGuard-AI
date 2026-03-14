const Case = require("../models/Case");
const Document = require("../models/Document");
const { decryptText, generateHash } = require("../utils/encryption");
const { extractLegalSections } = require("../utils/legalSectionExtractor");
const { generateDraft } = require("../utils/draftGenerator");

exports.generateDraftDocument = async (req, res, next) => {

    try {

        const { caseId, draftType } = req.body;

        const caseData = await Case.findById(caseId);
        if (!caseData) {
            return res.status(404).json({ message: "Case not found" });
        }

        const documents = await Document.find({ caseId });

        let combinedText = "";

        for (let doc of documents) {

            const decrypted = decryptText(doc.encryptedText, doc.iv);
            const hash = generateHash(decrypted);

            if (hash !== doc.sha256Hash) {
                return res.status(400).json({ message: "Document integrity issue" });
            }

            combinedText += decrypted + "\n\n";
        }

        const sectionsDetected = extractLegalSections(combinedText);

        const allSections = [
            ...sectionsDetected.IPC,
            ...sectionsDetected.CrPC,
            ...sectionsDetected.CPC,
            ...sectionsDetected.Constitution
        ];

        const facts = combinedText.substring(0, 800);

        const draft = await generateDraft({
            caseData,
            facts,
            sections: allSections,
            draftType
        });

        res.status(200).json({
            message: "Draft generated",
            draft
        });

    } catch (error) {
        next(error);
    }

};