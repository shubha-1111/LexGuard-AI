const Precedent = require("../models/Precedent");
const pdf = require("pdf-parse");

const { encryptText, decryptText, generateHash } = require("../utils/encryption");
const { cleanExtractedText } = require("../utils/textCleaner");
const { extractLegalCitations } = require("../utils/citationExtractor");
const { searchPrecedents } = require("../utils/precedentSearch");
const { vectorSearch } = require("../utils/vectorSearch");

exports.uploadPrecedent = async (req,res,next)=>{

try{

    const { title, court, year } = req.body;

    const pdfData = await pdf(req.file.buffer);

    const rawText = pdfData.text;

    const cleanedText = cleanExtractedText(rawText);

    const { encryptedData, iv } = encryptText(cleanedText);

    const hash = generateHash(cleanedText);

    const precedent = await Precedent.create({

        title,
        court,
        year,
        encryptedText: encryptedData,
        iv,
        sha256Hash: hash

    });

    res.status(201).json({
        success:true,
        message:"Precedent uploaded",
        precedent
    });

}catch(err){

    next(err);

}

};


exports.getPrecedent = async(req,res,next)=>{

try{

    const precedent = await Precedent.findById(req.params.id);

    if(!precedent){

        return res.status(404).json({
            message:"Precedent not found"
        });

    }

    const decryptedText = decryptText(
        precedent.encryptedText,
        precedent.iv
    );

    res.json({
        success:true,
        title:precedent.title,
        court:precedent.court,
        year:precedent.year,
        text:decryptedText
    });

}catch(err){

    next(err);

}

};

exports.extractSections = async(req,res,next)=>{

try{

    const precedent = await Precedent.findById(req.params.id);

    const text = decryptText(
        precedent.encryptedText,
        precedent.iv
    );

    const citations = extractLegalCitations(text);

    res.json({
        success:true,
        citations
    });

}catch(err){

    next(err);

}

};


exports.searchPrecedent = async(req,res,next)=>{

try{

    const { query } = req.body;

    const precedents = await Precedent.find();

    const decryptedDocs = precedents.map(p=>{

        const text = decryptText(p.encryptedText,p.iv);

        return {
            id:p._id,
            title:p.title,
            text
        };

    });

    const results = searchPrecedents(query,decryptedDocs);

    res.json({
        success:true,
        results
    });

}catch(err){

    next(err);

}

};
exports.vectorPrecedentSearch = async (req,res,next)=>{

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

const results = vectorSearch(query,decryptedDocs);

res.json({
success:true,
query,
results
});

}catch(err){

next(err);

}

};





