import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

const DRAFT_TYPES = [
  {
    id: "bail",
    label: "Bail Application",
    desc: "Anticipatory bail application for court filing",
    icon: "⚖",
  },
  {
    id: "notice",
    label: "Legal Notice",
    desc: "Formal legal notice to opposing party",
    icon: "📋",
  },
  {
    id: "summary",
    label: "Case Summary",
    desc: "Structured summary report of the case",
    icon: "📄",
  },
];

export default function DocumentDrafter() {
  const [cases, setCases]         = useState([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [draftType, setDraftType] = useState("");
  const [loading, setLoading]     = useState(false);
  const [draft, setDraft]         = useState("");
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const res = await API.get("/cases");
      const data = res.data;
      setCases(Array.isArray(data) ? data : data.cases || []);
    } catch {
      setError("Failed to load cases.");
    }
  };

  const handleGenerate = async () => {
    if (!selectedCase || !draftType) {
      setError("Please select both a case and document type.");
      return;
    }
    setLoading(true);
    setError("");
    setDraft("");
    try {
      const res = await API.post("/ai/draft", {
        caseId: selectedCase,
        draftType,
      });
      setDraft(res.data.draft || "");
    } catch (err) {
      setError(err.response?.data?.message || "Draft generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([draft], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const type = DRAFT_TYPES.find((d) => d.id === draftType);
    a.href     = url;
    a.download = `${type?.label || "draft"}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedCaseData = cases.find((c) => c._id === selectedCase);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6 max-w-4xl">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Legal Document Drafter
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Generate bail applications, legal notices and case summaries instantly
            </p>
          </div>

          {/* Step 1 — Select Case */}
          <div className="bg-white border rounded-lg p-5 mb-4 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3">
              Step 1 — Select Case
            </h2>
            <select
              value={selectedCase}
              onChange={(e) => { setSelectedCase(e.target.value); setDraft(""); }}
              className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Choose a case...</option>
              {cases.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.caseTitle} {c.caseNumber ? `· ${c.caseNumber}` : ""}
                </option>
              ))}
            </select>

            {selectedCaseData && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  ["Court",        selectedCaseData.courtName  || "—"],
                  ["Stage",        selectedCaseData.stage      || "—"],
                  ["Status",       selectedCaseData.status     || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-700">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2 — Select Document Type */}
          <div className="bg-white border rounded-lg p-5 mb-4 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3">
              Step 2 — Select Document Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DRAFT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => { setDraftType(type.id); setDraft(""); }}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    draftType === type.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <p className={`font-semibold text-sm mt-2 ${
                    draftType === type.id ? "text-blue-700" : "text-gray-700"
                  }`}>
                    {type.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedCase || !draftType}
            className="bg-blue-900 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 hover:bg-blue-800 transition-colors mb-6 w-full sm:w-auto"
          >
            {loading ? "Generating Draft..." : "Generate Document"}
          </button>

          {/* Loading */}
          {loading && (
            <div className="bg-white border rounded-lg p-8 text-center mb-6">
              <div className="flex justify-center gap-1 mb-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-sm text-gray-500">
                Generating document from case data...
              </p>
            </div>
          )}

          {/* Draft Output */}
          {draft && !loading && (
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="flex justify-between items-center px-5 py-3 border-b">
                <div>
                  <h2 className="font-semibold text-gray-700">
                    Generated Document
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {DRAFT_TYPES.find((d) => d.id === draftType)?.label} · {selectedCaseData?.caseTitle}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="text-sm bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded transition-colors"
                  >
                    Download .txt
                  </button>
                </div>
              </div>
              <div className="p-5">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed bg-gray-50 rounded p-4 border">
                  {draft}
                </pre>
              </div>
              <div className="px-5 py-3 border-t bg-gray-50 rounded-b-lg">
                <p className="text-xs text-gray-400">
                  This draft is AI-generated from your case data. Always review and verify before filing in court.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}