// ======================================
// TF-IDF VECTOR (used by document Q&A)
// ======================================

exports.createTfIdfVector = (chunks) => {

    const vectors = [];

    chunks.forEach(chunk => {

        const words = chunk
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .split(/\s+/);

        const freq = {};

        words.forEach(word => {
            freq[word] = (freq[word] || 0) + 1;
        });

        vectors.push(freq);

    });

    return vectors;
};



// ======================================
// SIMPLE VECTOR EMBEDDING
// ======================================

exports.createVector = (text) => {

    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/);

    const vector = {};

    words.forEach(word => {
        vector[word] = (vector[word] || 0) + 1;
    });

    return vector;
};



// ======================================
// COSINE SIMILARITY
// ======================================

exports.cosineSimilarity = (vecA, vecB) => {

    const intersection = Object.keys(vecA).filter(key => key in vecB);

    let dotProduct = 0;

    intersection.forEach(key => {
        dotProduct += vecA[key] * vecB[key];
    });

    const magnitudeA = Math.sqrt(
        Object.values(vecA).reduce((sum, val) => sum + val * val, 0)
    );

    const magnitudeB = Math.sqrt(
        Object.values(vecB).reduce((sum, val) => sum + val * val, 0)
    );

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
};