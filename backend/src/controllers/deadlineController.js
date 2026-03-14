const Deadline = require("../models/Deadline");
const Document = require("../models/Document");

const { extractDeadlines } = require("../utils/deadlineExtractor");



exports.extractDeadlinesFromDocument = async (req, res) =>
{
    try
    {
        const { documentId, caseId } = req.body;

        const document = await Document.findById(documentId);

        if (!document)
        {
            return res.status(404).json({ message: "Document not found" });
        }

        const text = document.parsedText;

        const detectedDeadlines = extractDeadlines(text);

        const savedDeadlines = [];

        for (const d of detectedDeadlines)
        {
            const deadline = new Deadline({
                ...d,
                caseId,
                sourceDocument: documentId,
                createdBy: req.user.id
            });

            await deadline.save();

            savedDeadlines.push(deadline);
        }

        res.json({
            success: true,
            deadlinesCreated: savedDeadlines.length,
            deadlines: savedDeadlines
        });

    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({ message: "Deadline extraction failed" });
    }
};

exports.getUpcomingDeadlines = async (req, res) =>
{
    try
    {
        const today = new Date();

        const deadlines = await Deadline.find({
            deadlineDate: { $gte: today },
            status: "upcoming"
        })
        .sort({ deadlineDate: 1 })
        .limit(50);

        res.json(deadlines);

    }
    catch (error)
    {
        res.status(500).json({ message: "Failed to fetch deadlines" });
    }
};

exports.getCaseDeadlines = async (req, res) =>
{
    try
    {
        const { caseId } = req.params;

        const deadlines = await Deadline.find({ caseId })
        .sort({ deadlineDate: 1 });

        res.json(deadlines);
    }
    catch (error)
    {
        res.status(500).json({ message: "Failed to fetch case deadlines" });
    }
};

exports.completeDeadline = async (req, res) =>
{
    try
    {
        const { id } = req.params;

        const deadline = await Deadline.findByIdAndUpdate(
            id,
            { status: "completed" },
            { new: true }
        );

        res.json(deadline);
    }
    catch (error)
    {
        res.status(500).json({ message: "Update failed" });
    }
};