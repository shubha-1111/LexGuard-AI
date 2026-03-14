const Case = require("../models/Case");
const User = require("../models/User");
const { createCaseSchema } = require("../utils/validationSchemas");

// Create Case (Admin only)
exports.createCase = async (req, res, next) => {
    try {
        const validatedData = createCaseSchema.parse(req.body);

        const lawyer = await User.findById(validatedData.assignedLawyer);
        const client = await User.findById(validatedData.client);

        if (!lawyer || lawyer.role !== "lawyer") {
            return res.status(400).json({ message: "Invalid lawyer ID" });
        }

        if (!client || client.role !== "client") {
            return res.status(400).json({ message: "Invalid client ID" });
        }

        const newCase = await Case.create(validatedData);

        res.status(201).json({
            message: "Case created successfully",
            case: newCase
        });

    } catch (error) {
        next(error);
    }
};

// Get My Cases (Secure Filtering)
exports.getMyCases = async (req, res, next) => {
    try {
        let cases;

        if (req.user.role === "admin") {
            cases = await Case.find();
        } else if (req.user.role === "lawyer") {
            cases = await Case.find({ assignedLawyer: req.user._id });
        } else if (req.user.role === "client") {
            cases = await Case.find({ client: req.user._id });
        }

        res.status(200).json({ cases });

    } catch (error) {
        next(error);
    }
};

// Get Single Case Securely
exports.getCaseById = async (req, res, next) => {
    try {
        const caseData = await Case.findById(req.params.id);

        if (!caseData) {
            return res.status(404).json({ message: "Case not found" });
        }

        // Ownership check
        if (
            req.user.role !== "admin" &&
            caseData.assignedLawyer.toString() !== req.user._id.toString() &&
            caseData.client.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "You do not have access to this case"
            });
        }

        res.status(200).json({ case: caseData });

    } catch (error) {
        next(error);
    }
};