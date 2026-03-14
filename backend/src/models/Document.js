const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        required: true,
        index: true
    },
    filename: {
        type: String,
        default: "document.pdf"
    },
    encryptedText: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    },
    sha256Hash: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });


module.exports = mongoose.model("Document", documentSchema);