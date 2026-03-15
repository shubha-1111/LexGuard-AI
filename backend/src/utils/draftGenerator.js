exports.generateDraft = async ({ caseData, facts, sections, draftType }) => {

    const court = caseData.courtName || "HON'BLE COURT OF COMPETENT JURISDICTION";
    const caseTitle = caseData.caseTitle || "UNTITLED CASE";
    const caseNo = caseData.caseNumber || "____/____";
    const stage = caseData.stage || "";
    const today = new Date().toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric"
    });
    const sectionList = sections.length > 0
        ? sections.join(", ")
        : "relevant provisions of law";

    if (draftType === "bail") {
        return `IN THE ${court.toUpperCase()}

CRIMINAL MISC. APPLICATION NO. _______ OF ${new Date().getFullYear()}

IN THE MATTER OF:
${caseTitle}
Case No.: ${caseNo}

AND IN THE MATTER OF:
APPLICATION FOR BAIL/ANTICIPATORY BAIL UNDER SECTION 438 Cr.P.C.

BETWEEN:

THE APPLICANT/ACCUSED                          ...PETITIONER

AND

STATE OF KARNATAKA                             ...RESPONDENT
THROUGH THE LEARNED PUBLIC PROSECUTOR

MOST RESPECTFULLY SHOWETH:

1. That the above-captioned matter is pending before this Hon'ble Court 
   and the present application is being filed on behalf of the Applicant/
   Accused seeking bail in connection with the same.

2. That the brief facts leading to the present application are as under:

   ${facts.replace(/\n/g, '\n   ')}

3. That the alleged offences in the present case involve the following 
   legal provisions:

   ${sectionList}

4. GROUNDS IN SUPPORT OF THE APPLICATION:

   a) That the Applicant is innocent and has been falsely implicated 
      in the present case out of malice and personal vendetta.

   b) That there is no prima facie case made out against the Applicant 
      as the allegations are vague, baseless and unsupported by evidence.

   c) That the Applicant has deep roots in the society and is not likely 
      to flee from justice or tamper with the evidence.

   d) That the Applicant undertakes to fully cooperate with the 
      investigating agency and shall abide by all conditions imposed 
      by this Hon'ble Court.

   e) That the Applicant has no prior criminal antecedents and has 
      always respected the process of law.

   f) That the personal liberty of the Applicant guaranteed under 
      Article 21 of the Constitution of India is at stake.

5. PRAYER:

   In view of the foregoing, it is most respectfully prayed that 
   this Hon'ble Court may graciously be pleased to:

   a) Grant bail/anticipatory bail to the Applicant in the 
      above-captioned matter; and

   b) Pass such other and further orders as this Hon'ble Court 
      may deem fit and proper in the facts and circumstances 
      of the case.

                              AND FOR THIS ACT OF KINDNESS
                         THE APPLICANT SHALL EVER PRAY.

Place: Bengaluru
Date: ${today}

                                        (ADVOCATE FOR THE APPLICANT)
                                        Enrolled No.: _______________
                                        Address: ____________________
                                        Mobile: _____________________

VERIFICATION:
I, the Applicant, do hereby verify that the contents of the above 
application are true and correct to the best of my knowledge and 
belief and nothing material has been concealed therefrom.

Verified at _____________ on this _____ day of _______, ${new Date().getFullYear()}.

                                                    APPLICANT/DEPONENT`;
    }

    if (draftType === "notice") {
        return `LEGAL NOTICE
(Under Section 80 C.P.C. / as applicable)

Date: ${today}

FROM:
ADVOCATE ___________________________
Enrollment No.: ____________________
Office Address: ____________________
Bengaluru, Karnataka - ______________
Mobile: ____________________________

TO:
The Addressee/Noticee
Address: ___________________________
___________________________________

SUBJECT: LEGAL NOTICE IN THE MATTER OF ${caseTitle.toUpperCase()}
         — CASE NO. ${caseNo}

Sir/Madam,

Under the instructions and on behalf of my client, I hereby serve 
upon you the following legal notice:

1. BACKGROUND OF THE MATTER:

   ${facts.replace(/\n/g, '\n   ')}

2. LEGAL PROVISIONS APPLICABLE:

   The acts/omissions on your part attract the following provisions 
   of law: ${sectionList}

3. DEMAND:

   In light of the above, my client hereby calls upon you to:

   a) Immediately remedy the grievance/wrong caused to my client;

   b) Comply with your legal obligations within FIFTEEN (15) DAYS 
      from the date of receipt of this notice;

   c) Respond to this notice in writing within the aforesaid period.

4. CONSEQUENCE OF NON-COMPLIANCE:

   Please take notice that in the event you fail to comply with the 
   above demands within the stipulated period, my client shall be 
   constrained to initiate appropriate legal proceedings before the 
   competent court/forum at your risk, cost and consequences, 
   without any further notice.

Please govern yourself accordingly.

Issued without prejudice to all other rights and remedies available 
to my client in law and in equity, all of which are expressly reserved.

Yours faithfully,

________________________________
ADVOCATE
(For and on behalf of the Client)

Place: Bengaluru
Date: ${today}

NOTE: This notice is issued without prejudice to all rights and 
remedies available to the client.`;
    }

    if (draftType === "summary") {
        return `CASE SUMMARY REPORT
Generated by LexGuard AI — For Legal Review Purposes Only

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Case Title    : ${caseTitle}
Case Number   : ${caseNo}
Court         : ${court}
Stage         : ${stage || "Not specified"}
Status        : ${caseData.status?.toUpperCase() || "OPEN"}
Next Hearing  : ${caseData.nextHearingDate
    ? new Date(caseData.nextHearingDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric"
      })
    : "Not scheduled"}
Report Date   : ${today}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACTS OF THE CASE (EXTRACTED FROM DOCUMENTS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${facts}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEGAL PROVISIONS DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${sections.length > 0
    ? sections.map((s, i) => `  ${i + 1}. ${s}`).join('\n')
    : "  No specific legal sections detected in uploaded documents."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTES FOR ADVOCATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. This summary is auto-generated from uploaded case documents.
2. Please verify all facts and legal citations before use in court.
3. For detailed analysis, use the Risk Analyzer and AI Legal 
   Assistant features in LexGuard AI.
4. This document is confidential and intended for advocate use only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    END OF REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated on: ${today}
Platform: LexGuard AI — Secure Legal Intelligence Platform
Disclaimer: AI-generated draft. Always verify before filing.`;
    }
};