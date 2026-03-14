const sectionDB = require("./sectionKnowledgeBase");

exports.explainSections = (citations)=>{

let explanations = [];

citations.forEach(citation=>{

if(sectionDB[citation]){

explanations.push({
section:citation,
title:sectionDB[citation].title,
description:sectionDB[citation].description,
punishment:sectionDB[citation].punishment
});

}

});

return explanations;

};