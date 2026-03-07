const mongoose = require("mongoose");

const hearingSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        required: true
    },
    hearingDate: {
        type: Date,
        required: true
    },
    remarks: {
        type: String
    },
    stage: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("Hearing", hearingSchema);