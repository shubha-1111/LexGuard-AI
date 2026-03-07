const AuditLog = require("../models/AuditLog");

exports.logAction = async ({
    user = null,
    action,
    resourceType,
    resourceId = null,
    req,
    status,
    details = ""
}) => {
    try {
        await AuditLog.create({
            user: user ? user._id : null,
            action,
            resourceType,
            resourceId,
            ipAddress: req?.ip || "Unknown",
            status,
            details
        });
    } catch (error) {
        console.error("Logging failed:", error.message);
    }
};