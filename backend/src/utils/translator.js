const axios = require("axios");

exports.translateText = async (text, targetLanguage) => {
    try {

        const url =
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;

        const response = await axios.get(url);

        const translated = response.data[0]
            .map(item => item[0])
            .join("");

        return translated;

    } catch (error) {

        console.error("GOOGLE TRANSLATION ERROR:", error.message);

        throw new Error("Translation failed");
    }
};