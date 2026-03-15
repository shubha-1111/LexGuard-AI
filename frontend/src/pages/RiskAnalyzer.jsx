import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

const riskConfig = {
  HIGH:   { color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",    bar: "bg-red-500",    width: "w-full" },
  MEDIUM: { color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", bar: "bg-yellow-400", width: "w-2/3" },
  LOW:    { color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200",  bar: "bg-green-500",  width: "w-1/3" },
};

const issueType = (issue) => {
  if (issue.toLowerCase().includes("missing")) return "missing";
  if (issue.toLowerCase().includes("weak"))    return "weak";
  return "info";
};

const issueConfig = {
  missing: { bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700",    icon: "✕", label: "Missing" },
  weak:    { bg: "bg-yellow-50",  border: "border-yellow-200", text: "text-yellow-700", icon: "⚠", label: "Weak"    },
  info:    { bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700",   icon: "i", label: "Info"    },
};

export default function RiskAnalyzer() {
  const [cases, setCases]         = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedCase, setSelectedCase]   = useState("");
  const [selectedDoc, setSelectedDoc]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");
  const [docName, setDocName]     = useState("");

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCase) loadDocuments(selectedCase);
    else setDocuments([]);
    setSelectedDoc("");
    setResult(null);
  }, [selectedCase]);

  const loadCases = async () => {
    try {
      const res = await API.get("/cases");
      const data = res.data;
      setCases(Array.isArray(data) ? data : data.cases || []);
    } catch (err) {
      setError("Failed to load cases.");
    }
  };

  const loadDocuments = async (caseId) => {
    setLoadingDocs(true);
    try {
      const res = await API.get(`/documents/case/${caseId}`);
      const data = res.data;
      setDocuments(Array.isArray(data) ? data : data.documents || []);
    } catch (err) {
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedDoc) {
      setError("Please select a document to analyze.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await API.post("/ai/risk-analysis", {
        documentId: selectedDoc,
      });
      setResult(res.data.result);
      const doc = documents.find((d) => d._id === selectedDoc);
      setDocName(doc?.filename || "Document");
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const risk = result ? riskConfig[result.riskLevel] || riskConfig.LOW : null;

  const missingClauses = result?.issues?.filter(i => issueType(i) === "missing") || [];
  const weakClauses    = result?.issues?.filter(i => issueType(i) === "weak")    || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6 max-w-3xl">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Risk Analyzer
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Analyze legal documents for missing clauses and weak language
            </p>
          </div>

          {/* Selection Panel */}
          <div className="bg-white border rounded-lg p-5 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">
              Select Document to Analyze
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Step 1 — Select Case
                </label>
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Choose a case...</option>
                  {cases.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.caseTitle}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCase && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Step 2 — Select Document
                  </label>
                  {loadingDocs ? (
                    <p className="text-sm text-gray-400">Loading documents...</p>
                  ) : documents.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      No documents uploaded for this case yet.
                    </p>
                  ) : (
                    <select
                      value={selectedDoc}
                      onChange={(e) => setSelectedDoc(e.target.value)}
                      className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="">Choose a document...</option>
                      {documents.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.filename || "document.pdf"} —{" "}
                          {new Date(d.createdAt).toLocaleDateString("en-IN")}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || !selectedDoc}
                className="bg-blue-900 text-white px-6 py-2 rounded text-sm font-medium disabled:opacity-50 hover:bg-blue-800 transition-colors w-full sm:w-auto"
              >
                {loading ? "Analyzing..." : "Analyze Document"}
              </button>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="bg-white border rounded-lg p-8 text-center">
              <div className="flex justify-center gap-1 mb-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-sm text-gray-500">Analyzing document for legal risks...</p>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-4">

              {/* Risk Score Card */}
              <div className={`border rounded-lg p-5 ${risk.bg} ${risk.border}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{docName}</p>
                    <h2 className="text-lg font-bold text-gray-800">
                      Risk Assessment
                    </h2>
                  </div>
                  <span className={`text-2xl font-bold ${risk.color}`}>
                    {result.riskLevel}
                  </span>
                </div>

                {/* Risk bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className={`h-2.5 rounded-full ${risk.bar} ${risk.width} transition-all duration-700`} />
                </div>
                <p className={`text-xs font-medium ${risk.color}`}>
                  {result.riskLevel === "HIGH"   && "High risk — immediate attention required"}
                  {result.riskLevel === "MEDIUM" && "Medium risk — review recommended"}
                  {result.riskLevel === "LOW"    && "Low risk — document looks good"}
                </p>
              </div>

              {/* Summary */}
              <div className="bg-white border rounded-lg p-5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {result.issues?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">Total Issues</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {missingClauses.length}
                    </p>
                    <p className="text-xs text-gray-500">Missing Clauses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {weakClauses.length}
                    </p>
                    <p className="text-xs text-gray-500">Weak Language</p>
                  </div>
                </div>
              </div>

              {/* Issues List */}
              {result.issues?.length > 0 ? (
                <div className="bg-white border rounded-lg p-5">
                  <h3 className="font-semibold text-gray-700 mb-4">
                    Detailed Issues
                  </h3>
                  <div className="space-y-2">
                    {result.issues.map((issue, i) => {
                      const type = issueType(issue);
                      const cfg  = issueConfig[type];
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-3 px-3 py-2 rounded border ${cfg.bg} ${cfg.border}`}
                        >
                          <span className={`text-xs font-bold mt-0.5 ${cfg.text}`}>
                            {cfg.icon}
                          </span>
                          <div className="flex-1">
                            <span className={`text-xs font-semibold ${cfg.text} mr-2`}>
                              [{cfg.label}]
                            </span>
                            <span className="text-sm text-gray-700">{issue}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-green-200 rounded-lg p-5 text-center">
                  <p className="text-green-700 font-medium">
                    No issues found — document passes all checks
                  </p>
                </div>
              )}

              {/* What to do */}
              {result.riskLevel !== "LOW" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 text-sm mb-2">
                    Recommended Actions
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {missingClauses.length > 0 && (
                      <li>• Add the {missingClauses.length} missing clause(s) to the document</li>
                    )}
                    {weakClauses.length > 0 && (
                      <li>• Review and strengthen {weakClauses.length} weak legal phrase(s)</li>
                    )}
                    <li>• Use AI Legal Assistant to draft replacement clauses</li>
                    <li>• Re-analyze after making changes</li>
                  </ul>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}