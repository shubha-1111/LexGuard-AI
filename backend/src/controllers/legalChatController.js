const Document = require("../models/Document");
const Precedent = require("../models/Precedent");

const { decryptText } = require("../utils/encryption");

const { vectorSearch } = require("../utils/vectorSearch");

const { generateLegalAnswer } = require("../utils/legalChatEngine");
const { generateSummary } = require("../utils/aiSummarizer");

exports.askLegalAI = async (req,res,next)=>{

try{

const { question } = req.body;

const documents = await Document.find();

const decryptedDocs = documents.map(d=>{

return decryptText(d.encryptedText,d.iv);

});

const precedents = await Precedent.find();

const precedentDocs = precedents.map(p=>{

const text = decryptText(p.encryptedText,p.iv);

return{
id:p._id,
title:p.title,
text
};

});

const precedentResults = vectorSearch(question,precedentDocs);

const precedentTexts = precedentResults.map(r=>r.document.text);

const context = [...decryptedDocs,...precedentTexts]
.slice(0,5)
.join("\n\n");

const answer = await generateSummary(context,question);

res.json({
success:true,
question,
answer,
precedents:precedentResults
});

}catch(err){

next(err);

}

};