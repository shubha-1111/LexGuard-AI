const riskKeywords = [
    "may",
    "might",
    "possible",
    "approximate",
    "somewhat",
    "attempt",
    "try"
];

const requiredClauses = [
    "jurisdiction",
    "liability",
    "indemnity",
    "termination",
    "confidentiality"
];

exports.analyzeDocumentRisk = (text) => {

    const issues = [];
    let riskScore = 0;

    const lower = text.toLowerCase();

    // Check missing clauses
    requiredClauses.forEach(clause => {
        if (!lower.includes(clause)) {
            issues.push(`Missing clause: ${clause}`);
            riskScore += 2;
        }
    });

    // Check weak legal language
    riskKeywords.forEach(word => {
        if (lower.includes(word)) {
            issues.push(`Weak legal wording detected: "${word}"`);
            riskScore += 1;
        }
    });

    let riskLevel = "LOW";

    if (riskScore >= 6) riskLevel = "HIGH";
    else if (riskScore >= 3) riskLevel = "MEDIUM";

    return {
        riskLevel,
        issues
    };
};