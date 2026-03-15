const { translate } = require("@vitalets/google-translate-api");

exports.translateText = async (text, targetLanguage) => {
    try {
        const chunkSize = 4000;
        const chunks = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.slice(i, i + chunkSize));
        }
        const results = [];
        for (const chunk of chunks) {
            const result = await translate(chunk, { to: targetLanguage });
            results.push(result.text);
            // Small delay between chunks to be safe
            await new Promise(r => setTimeout(r, 300));
        }
        return results.join(" ");
    } catch (error) {
        console.error("Translation error:", error.message);
        return text;
    }
};