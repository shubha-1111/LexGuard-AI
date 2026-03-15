import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

const LANGUAGES = [
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "hi", label: "Hindi",   native: "हिन्दी" },
];

export default function Translator() {
  const [cases, setCases]           = useState([]);
  const [documents, setDocuments]   = useState([]);
  const [selectedCase, setSelectedCase]   = useState("");
  const [selectedDoc, setSelectedDoc]     = useState("");
  const [targetLang, setTargetLang] = useState("kn");
  const [loading, setLoading]       = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [result, setResult]         = useState("");
  const [error, setError]           = useState("");
  const [copied, setCopied]         = useState(false);

  useEffect(() => { loadCases(); }, []);

  useEffect(() => {
    if (selectedCase) loadDocuments(selectedCase);
    else setDocuments([]);
    setSelectedDoc("");
    setResult("");
  }, [selectedCase]);

  const loadCases = async () => {
    try {
      const res = await API.get("/cases");
      const data = res.data;
      setCases(Array.isArray(data) ? data : data.cases || []);
    } catch {
      setError("Failed to load cases.");
    }
  };

  const loadDocuments = async (caseId) => {
    setLoadingDocs(true);
    try {
      const res = await API.get(`/documents/case/${caseId}`);
      const data = res.data;
      setDocuments(Array.isArray(data) ? data : data.documents || []);
    } catch {
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleTranslate = async () => {
    if (!selectedDoc) {
      setError("Please select a document.");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await API.post("/ai/translate", {
        documentId: selectedDoc,
        targetLanguage: targetLang,
      });
      setResult(res.data.translatedText || "");
    } catch (err) {
      setError(err.response?.data?.message || "Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const lang = LANGUAGES.find((l) => l.code === targetLang);
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `translation_${lang?.label}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedDocName = documents.find((d) => d._id === selectedDoc)?.filename || "";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6 max-w-4xl">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Document Translator
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Translate legal documents to Kannada or Hindi for client understanding
            </p>
          </div>

          {/* Selection Panel */}
          <div className="bg-white border rounded-lg p-5 mb-4 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">
              Select Document
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Case</label>
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Choose a case...</option>
                  {cases.map((c) => (
                    <option key={c._id} value={c._id}>{c.caseTitle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Document</label>
                {loadingDocs ? (
                  <p className="text-sm text-gray-400 mt-2">Loading...</p>
                ) : (
                  <select
                    value={selectedDoc}
                    onChange={(e) => { setSelectedDoc(e.target.value); setResult(""); }}
                    disabled={!selectedCase || documents.length === 0}
                    className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">
                      {!selectedCase
                        ? "Select a case first"
                        : documents.length === 0
                        ? "No documents found"
                        : "Choose a document..."}
                    </option>
                    {documents.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.filename || "document.pdf"}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-white border rounded-lg p-5 mb-4 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3">
              Target Language
            </h2>
            <div className="flex gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setTargetLang(lang.code); setResult(""); }}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all text-center ${
                    targetLang === lang.code
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <p className={`text-lg font-bold ${
                    targetLang === lang.code ? "text-blue-700" : "text-gray-600"
                  }`}>
                    {lang.native}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{lang.label}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleTranslate}
            disabled={loading || !selectedDoc}
            className="bg-blue-900 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 hover:bg-blue-800 transition-colors mb-6 w-full sm:w-auto"
          >
            {loading ? "Translating..." : `Translate to ${LANGUAGES.find(l => l.code === targetLang)?.label}`}
          </button>

          {/* Loading */}
          {loading && (
            <div className="bg-white border rounded-lg p-8 text-center mb-6">
              <div className="flex justify-center gap-1 mb-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-sm text-gray-500">Translating document...</p>
              <p className="text-xs text-gray-400 mt-1">
                Large documents may take 10-15 seconds
              </p>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="flex justify-between items-center px-5 py-3 border-b">
                <div>
                  <h2 className="font-semibold text-gray-700">
                    Translation Result
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedDocName} →{" "}
                    {LANGUAGES.find((l) => l.code === targetLang)?.label}
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
                    Download
                  </button>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {result}
                </p>
              </div>
              <div className="px-5 py-3 border-t bg-gray-50 rounded-b-lg">
                <p className="text-xs text-gray-400">
                  Translation powered by MyMemory — free, no API key required. Always verify legal translations before use.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}