exports.cleanExtractedText = (text) => {

    if (!text) return "";

    return text
        .replace(/[^\x00-\x7F]/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .replace(/\s+/g, " ")
        .trim();
};