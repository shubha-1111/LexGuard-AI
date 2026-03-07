const mongoose = require("mongoose");

const precedentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    court: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    encryptedText: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    },
    sha256Hash: {
        type: String,
        required: true
    }
},{timestamps:true});

module.exports = mongoose.model("Precedent",precedentSchema);