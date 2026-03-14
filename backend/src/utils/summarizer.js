const natural = require("natural");

const tokenizer = new natural.SentenceTokenizer();

// Basic sanitization
const sanitizeText = (text) => {
    if (!text || typeof text !== "string") return "";

    // Remove script-like patterns
    return text
        .replace(/<script.*?>.*?<\/script>/gi, "")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/[\r\n]+/g, " ")
        .trim();
};

// Limit size to prevent abuse
const limitTextSize = (text, maxChars = 5000) => {
    return text.length > maxChars ? text.slice(0, maxChars) : text;
};

exports.generateSummary = (text) => {
    try {
        const cleanText = sanitizeText(text);
        const safeText = limitTextSize(cleanText);

        const sentences = tokenizer.tokenize(safeText);

        if (sentences.length <= 3) {
            return safeText;
        }

        // Simple frequency-based scoring
        const wordFreq = {};
        safeText.split(/\s+/).forEach(word => {
            word = word.toLowerCase();
            if (word.length > 3) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        const sentenceScores = sentences.map(sentence => {
            let score = 0;
            sentence.split(/\s+/).forEach(word => {
                word = word.toLowerCase();
                if (wordFreq[word]) {
                    score += wordFreq[word];
                }
            });
            return { sentence, score };
        });

        sentenceScores.sort((a, b) => b.score - a.score);

        const topSentences = sentenceScores.slice(0, 3).map(s => s.sentence);

        return topSentences.join(" ");

    } catch (error) {
        return "Unable to generate summary";
    }
};