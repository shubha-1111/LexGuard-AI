const Precedent = require("../models/Precedent");

const { decryptText } = require("../utils/encryption");
const { searchPrecedents } = require("../utils/precedentSearch");
const { extractLegalCitations } = require("../utils/citationExtractor");
const { explainSections } = require("../utils/legalSectionExtractor");



exports.legalResearchQuery = async (req,res,next)=>{

try{

const { query } = req.body;

const precedents = await Precedent.find();

const decryptedDocs = precedents.map(p=>{

const text = decryptText(p.encryptedText,p.iv);

return{
id:p._id,
title:p.title,
text
};

});


const searchResults = searchPrecedents(query,decryptedDocs);


let citations = [];

searchResults.forEach(result=>{

const found = extractLegalCitations(result.precedent.text);

citations.push(...found);

});


citations = [...new Set(citations)];

const explanations = explainSections(citations);


res.json({

success:true,
query,
matchedPrecedents:searchResults,
citations,
sectionExplanations:explanations

});


}catch(err){

next(err);

}

};