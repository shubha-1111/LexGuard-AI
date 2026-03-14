import React, { useState } from "react";
import API from "../services/api";

const DocumentAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF and TXT files are allowed.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await API.post("/documents/analyze", formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">AI Document Analyzer</h1>

      <div className="border-2 border-dashed border-gray-300 rounded p-6 mb-4">
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setError("");
            setResult(null);
          }}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-2">Accepted: PDF, TXT</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        onClick={uploadFile}
        disabled={loading || !file}
        className="bg-blue-900 text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors"
      >
        {loading ? "Analyzing..." : "Analyze Document"}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          {result.summary && (
            <div className="bg-white border rounded p-4">
              <h2 className="font-semibold mb-2">Summary</h2>
              <p className="text-gray-700">{result.summary}</p>
            </div>
          )}

          {result.riskLevel && (
            <div className={`border rounded p-4 ${
              result.riskLevel === "HIGH" ? "bg-red-50 border-red-200" :
              result.riskLevel === "MEDIUM" ? "bg-yellow-50 border-yellow-200" :
              "bg-green-50 border-green-200"
            }`}>
              <h2 className="font-semibold mb-2">
                Risk Level: <span className="font-bold">{result.riskLevel}</span>
              </h2>
              {result.issues?.length > 0 && (
                <ul className="list-disc list-inside text-sm space-y-1">
                  {result.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentAnalyzer;