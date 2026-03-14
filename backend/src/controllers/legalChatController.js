const Document = require("../models/Document");
const Precedent = require("../models/Precedent");

const { decryptText } = require("../utils/encryption");

const { vectorSearch } = require("../utils/vectorSearch");

const { generateLegalAnswer } = require("../utils/legalChatEngine");

exports.askLegalAI = async (req,res,next)=>{

try{

const { question } = req.body;

if(!question || question.length < 5){
return res.status(400).json({message:"Invalid question"});
}


// ==============================
// FETCH DOCUMENTS
// ==============================

const documents = await Document.find();

const decryptedDocs = documents.map(d=>{

return decryptText(d.encryptedText,d.iv);

});


// ==============================
// FETCH PRECEDENTS
// ==============================

const precedents = await Precedent.find();

const precedentDocs = precedents.map(p=>{

const text = decryptText(p.encryptedText,p.iv);

return{
id:p._id,
title:p.title,
text
};

});


// ==============================
// VECTOR PRECEDENT SEARCH
// ==============================

const precedentResults = vectorSearch(question,precedentDocs);

const precedentTexts = precedentResults.map(r=>r.document.text);


// ==============================
// GENERATE LEGAL ANSWER
// ==============================

const answer = generateLegalAnswer(
[...decryptedDocs,...precedentTexts],
question
);


// ==============================
// RESPONSE
// ==============================

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