// Extract dates and related events from text
exports.extractTimeline = (text) => {
    const dateRegex = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/g;

    const sentences = text.split(/(?<=[.?!])\s+/);

    const events = [];

    for (let sentence of sentences) {
        const matches = sentence.match(dateRegex);
        if (matches) {
            for (let dateStr of matches) {
                const parsedDate = parseDate(dateStr);
                if (parsedDate) {
                    events.push({
                        date: parsedDate,
                        originalDate: dateStr,
                        event: sentence.trim()
                    });
                }
            }
        }
    }

    // Sort chronologically
    events.sort((a, b) => a.date - b.date);

    return events;
};

// Convert string date to JS Date
function parseDate(dateStr) {
    const parts = dateStr.split(/[\/\-\.]/);

    if (parts.length !== 3) return null;

    let [day, month, year] = parts.map(Number);

    if (year < 100) {
        year += 2000;
    }

    return new Date(year, month - 1, day);
}