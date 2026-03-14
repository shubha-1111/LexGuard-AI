import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCaseById } from "../services/caseService";
import { uploadDocument, getDocuments } from "../services/documentService";
import API from "../services/api";

const StatusBadge = ({ status }) => {
  const map = {
    open:    "bg-green-100 text-green-800",
    closed:  "bg-gray-100 text-gray-600",
    pending: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${map[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
};

const TimelineEvent = ({ event, isLast }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-3 h-3 rounded-full bg-blue-600 mt-1 shrink-0" />
      {!isLast && <div className="w-0.5 bg-blue-200 flex-1 mt-1" />}
    </div>
    <div className="pb-6">
      <p className="text-xs font-semibold text-blue-700 mb-0.5">
        {new Date(event.date).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric"
        })}
      </p>
      <p className="text-sm text-gray-700">{event.event}</p>
    </div>
  </div>
);

export default function CaseDetails() {
  const { id } = useParams();
  const [caseData, setCaseData]     = useState(null);
  const [documents, setDocuments]   = useState([]);
  const [deadlines, setDeadlines]   = useState([]);
  const [timeline, setTimeline]     = useState([]);
  const [file, setFile]             = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [activeTab, setActiveTab]   = useState("overview");
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [caseRes, docsRes, deadlinesRes] = await Promise.allSettled([
        getCaseById(id),
        getDocuments(id),
        API.get(`/deadlines/case/${id}`),
      ]);
      if (caseRes.status === "fulfilled") {
         const d = caseRes.value.data;
         setCaseData(d.case || d);
      }
      if (docsRes.status === "fulfilled") {
         const d = docsRes.value.data;
        setDocuments(Array.isArray(d) ? d : d.documents || d.data || []);
     }
      if (deadlinesRes.status === "fulfilled") setDeadlines(deadlinesRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const res = await uploadDocument(id, file);
      // If backend returns timeline data, show it
      if (res.data?.timeline) setTimeline(res.data.timeline);
      setFile(null);
      e.target.reset();
      fetchAll();
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-gray-400">
      Loading case...
    </div>
  );

  if (!caseData) return (
    <div className="flex items-center justify-center min-h-screen text-red-500">
      Case not found.
    </div>
  );

  const tabs = ["overview", "documents", "deadlines", "timeline"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link to="/cases" className="hover:text-blue-600">Cases</Link>
          <span>/</span>
          <span className="text-gray-800">{caseData.caseTitle}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {caseData.caseTitle}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {caseData.caseNumber && `Case No. ${caseData.caseNumber} · `}
              {caseData.courtName || ""}
            </p>
          </div>
          <StatusBadge status={caseData.status} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-t capitalize transition-colors ${
                activeTab === tab
                  ? "bg-blue-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-4xl">

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="bg-white shadow rounded p-5 grid grid-cols-2 gap-4">
              {[
                ["Status",       caseData.status],
                ["Stage",        caseData.stage || "—"],
                ["Court",        caseData.courtName || "—"],
                ["Case Number",  caseData.caseNumber || "—"],
                ["Next Hearing", formatDate(caseData.nextHearingDate)],
                ["Opened",       formatDate(caseData.createdAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            {caseData.description && (
              <div className="bg-white shadow rounded p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {caseData.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="bg-white shadow rounded p-5">
              <h2 className="font-semibold text-gray-700 mb-4">Upload Document</h2>
              <form onSubmit={handleUpload} className="flex gap-3 items-center flex-wrap">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="text-sm"
                />
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="bg-blue-900 text-white px-4 py-2 rounded text-sm disabled:opacity-50 hover:bg-blue-800 transition-colors"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </form>
              {uploadError && (
                <p className="text-red-600 text-sm mt-2">{uploadError}</p>
              )}
            </div>

            <div className="bg-white shadow rounded p-5">
              <h2 className="font-semibold text-gray-700 mb-4">
                Documents ({documents.length})
              </h2>
              {documents.length === 0 ? (
                <p className="text-gray-400 text-sm">No documents uploaded yet.</p>
              ) : (
                <ul className="divide-y">
                  {documents.map((doc) => (
                    <li key={doc._id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {doc.filename || doc.originalName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {doc.fileType || "file"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Deadlines Tab */}
        {activeTab === "deadlines" && (
          <div className="bg-white shadow rounded p-5">
            <h2 className="font-semibold text-gray-700 mb-4">
              Deadlines ({deadlines.length})
            </h2>
            {deadlines.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No deadlines. Upload a document to extract deadlines automatically.
              </p>
            ) : (
              <ul className="divide-y">
                {deadlines.map((d) => (
                  <li key={d._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {d.title || d.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Due: {formatDate(d.dueDate)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      d.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {d.completed ? "Done" : "Pending"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="bg-white shadow rounded p-5">
            <h2 className="font-semibold text-gray-700 mb-6">Case Timeline</h2>
            {timeline.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">
                  No timeline events yet.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Upload a document in the Documents tab — dates will be extracted automatically.
                </p>
              </div>
            ) : (
              <div className="pl-2">
                {timeline.map((event, i) => (
                  <TimelineEvent
                    key={i}
                    event={event}
                    isLast={i === timeline.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}