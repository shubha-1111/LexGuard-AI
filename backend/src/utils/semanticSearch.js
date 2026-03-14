const { createVector, cosineSimilarity } = require("./embeddings");

exports.semanticSearch = (query, documents) => {

    const queryVector = createVector(query);

    const scored = documents.map(doc => {

        const docVector = createVector(doc.text);

        const score = cosineSimilarity(queryVector, docVector);

        return {
            document: doc,
            score
        };

    });

    scored.sort((a,b) => b.score - a.score);

    return scored.slice(0,5);
};