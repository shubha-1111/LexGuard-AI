const { extractLegalCitations } = require("./citationExtractor");

exports.analyzeCaseFacts = (text)=>{

const risks = [];

if(text.includes("murder")){
risks.push("Possible IPC 302 (murder charge)");
}

if(text.includes("fraud")){
risks.push("Possible IPC 420 (cheating)");
}

if(text.includes("evidence")){
risks.push("Evidence strength must be evaluated");
}

const citations = extractLegalCitations(text);

return{
risks,
citations
};

};