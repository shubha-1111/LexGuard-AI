const Hearing = require("../models/Hearing");
const Case = require("../models/Case");

// ================= ADD HEARING =================
exports.addHearing = async (req, res, next) => {
    try {
        const { caseId, hearingDate, remarks, stage } = req.body;

        const caseData = await Case.findById(caseId);
        if (!caseData) {
            return res.status(404).json({ message: "Case not found" });
        }

        const hearing = await Hearing.create({
            caseId,
            hearingDate,
            remarks,
            stage
        });

        // Update next hearing in Case
        caseData.nextHearingDate = hearingDate;
        caseData.stage = stage;
        await caseData.save();

        res.status(201).json({
            message: "Hearing added",
            hearing
        });

    } catch (error) {
        next(error);
    }
};

// ================= GET UPCOMING HEARINGS =================
exports.getUpcomingHearings = async (req, res, next) => {
    try {
        const today = new Date();

        const hearings = await Hearing.find({
            hearingDate: { $gte: today }
        })
        .populate("caseId", "caseTitle courtName caseNumber")
        .sort({ hearingDate: 1 });

        res.status(200).json({
            count: hearings.length,
            hearings
        });

    } catch (error) {
        next(error);
    }
};

// ================= GET PAST HEARINGS =================
exports.getPastHearings = async (req, res, next) => {
    try {
        const today = new Date();

        const hearings = await Hearing.find({
            hearingDate: { $lt: today }
        })
        .populate("caseId", "caseTitle courtName caseNumber")
        .sort({ hearingDate: -1 });

        res.status(200).json({
            count: hearings.length,
            hearings
        });

    } catch (error) {
        next(error);
    }
};