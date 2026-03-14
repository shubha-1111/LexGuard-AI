const { extractDatesFromText } = require("./dateExtractor");

function detectDeadlineType(sentence)
{
    const s = sentence.toLowerCase();

    if (s.includes("hearing")) return "hearing";
    if (s.includes("file") || s.includes("filing")) return "filing";
    if (s.includes("reply")) return "reply";
    if (s.includes("notice")) return "notice";
    if (s.includes("evidence")) return "evidence";

    return "other";
}

function extractDeadlines(text)
{
    const dates = extractDatesFromText(text);

    const deadlines = dates.map(d => {

        return {
            title: `Detected deadline: ${d.text}`,
            deadlineDate: d.date,
            type: detectDeadlineType(d.text),
            extractedAutomatically: true
        };

    });

    return deadlines;
}

module.exports = { extractDeadlines };