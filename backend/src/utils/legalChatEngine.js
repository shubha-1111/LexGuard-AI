const { chunkDocument, rankChunks } = require("./similarity");
const { createTfIdfVector } = require("./embeddings");

exports.generateLegalAnswer = (documents, question) => {

let combinedText = "";

documents.forEach(doc=>{
combinedText += doc + "\n\n";
});

const chunks = chunkDocument(combinedText);

const tfidf = createTfIdfVector(chunks);

const ranked = rankChunks(tfidf, question, chunks, 5);

const answer = ranked
    .slice(0,2)
    .map(r=>r.text)
    .join("\n\n");

    
return answer;

};