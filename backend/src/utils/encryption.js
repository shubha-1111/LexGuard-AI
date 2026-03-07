const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY);

exports.encryptText = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return {
        encryptedData: encrypted,
        iv: iv.toString("hex")
    };
};

exports.decryptText = (encryptedData, iv) => {
    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(iv, "hex")
    );

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};

exports.generateHash = (text) => {
    return crypto.createHash("sha256").update(text).digest("hex");
};