const Case = require("../models/Case");

exports.generateDraft = async ({ caseData, facts, sections, draftType }) => {

    if (draftType === "bail") {

        return `
IN THE HONOURABLE COURT OF ${caseData.courtName || "COMPETENT COURT"}

Case Title: ${caseData.caseTitle}
Case Number: ${caseData.caseNumber || "N/A"}

APPLICATION FOR ANTICIPATORY BAIL

Most Respectfully Submitted:

1. That the present application is being filed seeking anticipatory bail in connection with the above mentioned matter.

2. That the allegations against the accused arise from the following facts:

${facts}

3. That the alleged offences involve the following legal provisions:

${sections.join(", ")}

4. That the applicant is innocent and has been falsely implicated.

5. That the applicant undertakes to cooperate with the investigation.

PRAYER

It is therefore respectfully prayed that this Hon'ble Court may be pleased to grant anticipatory bail to the applicant in the interest of justice.

Filed By:
Advocate for the Applicant
`;

    }

    if (draftType === "notice") {

        return `
LEGAL NOTICE

From:
Advocate representing ${caseData.client}

Subject: Legal Notice regarding ${caseData.caseTitle}

Sir/Madam,

Under instructions from my client, I hereby serve you the following legal notice:

${facts}

You are hereby called upon to resolve this matter within 15 days of receipt of this notice, failing which my client shall initiate appropriate legal proceedings.

Regards,
Advocate
`;

    }

    if (draftType === "summary") {

        return `
CASE SUMMARY REPORT

Case Title: ${caseData.caseTitle}
Court: ${caseData.courtName || "N/A"}

Facts Identified:

${facts}

Legal Sections Detected:

${sections.join(", ")}

This report is generated automatically to assist legal review.
`;

    }

};