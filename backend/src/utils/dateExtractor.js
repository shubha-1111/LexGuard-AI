const chrono = require("chrono-node");

function extractDatesFromText(text)
{
    const results = chrono.parse(text);

    const dates = results.map(r => ({
        date: r.start.date(),
        text: r.text,
        index: r.index
    }));

    return dates;
}

module.exports = { extractDatesFromText };