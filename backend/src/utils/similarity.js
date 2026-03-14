// ==============================
// DOCUMENT CHUNKING
// ==============================

exports.chunkDocument = (text) => {

    if (!text) return [];

    const sentences = text.split(/[.?!]\s+/);

    const chunks = [];

    const chunkSize = 5;

    for (let i = 0; i < sentences.length; i += chunkSize) {

        chunks.push(
            sentences.slice(i, i + chunkSize).join(". ")
        );

    }

    return chunks;
};



// ==============================
// SIMPLE SIMILARITY RANKING
// ==============================

exports.rankChunks = (tfidf, query, chunks, topK = 5) => {

    const queryWords = query.toLowerCase().split(/\s+/);

    const scores = chunks.map(chunk => {

        const words = chunk.toLowerCase().split(/\s+/);

        let score = 0;

        queryWords.forEach(q => {

            if (words.includes(q)) {
                score++;
            }

        });

        return {
            text: chunk,
            score
        };

    });

    scores.sort((a,b) => b.score - a.score);

    return scores.slice(0, topK);
};