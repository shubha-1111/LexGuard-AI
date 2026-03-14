const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    action: {
        type: String,
        required: true
    },
    resourceType: {
        type: String,
        required: true
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    ipAddress: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ["SUCCESS", "FAILURE"],
        required: true
    },
    details: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditLogSchema);