const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
    caseTitle: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    assignedLawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["open", "closed", "pending"],
        default: "open"
    },
    courtName: {
        type: String,
        required: false
    },
    caseNumber: {
        type: String,
        required: false
    },
    nextHearingDate: {
        type: Date,
        required: false
    },
    stage: {
        type: String,
        required: false
    }
    
}, { timestamps: true });

module.exports = mongoose.model("Case", caseSchema);