const { computeSimilarity } = require("./similarity");

exports.searchPrecedents = (query, precedents) => {

    const scored = precedents.map(p => {

        const score = computeSimilarity(query,p.text);

        return {
            precedent:p,
            score
        };

    });

    scored.sort((a,b)=>b.score-a.score);

    return scored.slice(0,5);

};