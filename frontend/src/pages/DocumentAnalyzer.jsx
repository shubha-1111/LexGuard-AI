import React, { useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function DocumentAnalyzer() {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");

  const handleAnalyze = async () => {
    if (!file) { setError("Please select a PDF file."); return; }
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Step 1 — upload to a temporary case or use direct analyze
      const formData = new FormData();
      formData.append("file", file);

      // Use the risk analysis endpoint which accepts direct text
      // First extract text via a dedicated route
      const uploadRes = await API.post(
        "/documents/69a454524c28edd62a5fc522",
        formData
      );

      const documentId = uploadRes.data.documentId;

      // Step 2 — get summary
      const summaryRes = await API.get(`/documents/${documentId}/summary`);

      // Step 3 — get risk analysis
      const riskRes = await API.post("/ai/risk-analysis", { documentId });

      setResult({
        summary:   summaryRes.data.summary,
        riskLevel: riskRes.data.result?.riskLevel,
        issues:    riskRes.data.result?.issues || [],
      });
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const riskColors = {
    HIGH:   "text-red-700 bg-red-50 border-red-200",
    MEDIUM: "text-yellow-700 bg-yellow-50 border-yellow-200",
    LOW:    "text-green-700 bg-green-50 border-green-200",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6 max-w-3xl">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Quick Document Analyzer
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Upload any legal PDF for instant summary and risk analysis
            </p>
          </div>

          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setError("");
                setResult(null);
              }}
              className="w-full text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">PDF files only · Max 5MB</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !file}
            className="bg-blue-900 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 hover:bg-blue-800 transition-colors w-full mb-6"
          >
            {loading ? "Analyzing..." : "Analyze Document"}
          </button>

          {loading && (
            <div className="bg-white border rounded-lg p-8 text-center">
              <div className="flex justify-center gap-1 mb-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-sm text-gray-500">Extracting text and analyzing...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">

              {/* Risk Badge */}
              {result.riskLevel && (
                <div className={`border rounded-lg p-4 flex justify-between items-center ${riskColors[result.riskLevel]}`}>
                  <div>
                    <p className="font-semibold">Risk Level</p>
                    <p className="text-xs mt-0.5">
                      {result.issues.length} issue(s) detected
                    </p>
                  </div>
                  <span className="text-3xl font-bold">{result.riskLevel}</span>
                </div>
              )}

              {/* Summary */}
              {result.summary && (
                <div className="bg-white border rounded-lg p-5">
                  <h2 className="font-semibold text-gray-700 mb-3">
                    AI Summary
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              )}

              {/* Issues */}
              {result.issues.length > 0 && (
                <div className="bg-white border rounded-lg p-5">
                  <h2 className="font-semibold text-gray-700 mb-3">
                    Issues Found
                  </h2>
                  <ul className="space-y-2">
                    {result.issues.map((issue, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-red-500 shrink-0">✕</span>
                        {issue}
                      </li>
                    ))}
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