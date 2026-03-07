const axios = require("axios");

exports.generateSummary = async (context, question) => {

const prompt = `
You are a legal assistant.

Using the following legal text, answer the question clearly.

Question:
${question}

Legal text:
${context}

Provide a short legal explanation.
`;

const response = await axios.post(
"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY",
{
contents:[
{
parts:[
{ text: prompt }
]
}
]
}
);

return response.data.candidates[0].content.parts[0].text;

};