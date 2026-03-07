const AuditLog = require("../models/AuditLog");

// ================= GET LOGS (ADMIN ONLY) =================
exports.getLogs = async (req, res, next) => {
    try {
        const { status, action } = req.query;

        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (action) {
            filter.action = action;
        }

        const logs = await AuditLog.find(filter)
            .populate("user", "email role")
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json({
            count: logs.length,
            logs
        });

    } catch (error) {
        next(error);
    }
};