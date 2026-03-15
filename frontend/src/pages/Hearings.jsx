import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
};

const formatDateInput = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 16);
};

const HearingCard = ({ hearing, past }) => (
  <div className={`bg-white border rounded-lg p-4 flex justify-between items-start ${
    past ? "opacity-70" : ""
  }`}>
    <div className="flex gap-4 items-start">
      <div className={`text-center px-3 py-2 rounded-lg min-w-[56px] ${
        past ? "bg-gray-100" : "bg-blue-50"
      }`}>
        <p className={`text-xl font-bold ${past ? "text-gray-500" : "text-blue-900"}`}>
          {new Date(hearing.hearingDate).getDate()}
        </p>
        <p className={`text-xs font-medium ${past ? "text-gray-400" : "text-blue-600"}`}>
          {new Date(hearing.hearingDate).toLocaleDateString("en-IN", { month: "short" })}
        </p>
        <p className="text-xs text-gray-400">
          {new Date(hearing.hearingDate).getFullYear()}
        </p>
      </div>
      <div>
        <p className="font-semibold text-gray-800">
          {hearing.caseId?.caseTitle || "Unknown Case"}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {hearing.caseId?.courtName || "Court not specified"}
          {hearing.caseId?.caseNumber && ` · ${hearing.caseId.caseNumber}`}
        </p>
        {hearing.stage && (
          <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            {hearing.stage}
          </span>
        )}
        {hearing.remarks && (
          <p className="text-xs text-gray-500 mt-1 italic">
            {hearing.remarks}
          </p>
        )}
      </div>
    </div>
    <p className="text-xs text-gray-400 shrink-0 ml-4">
      {new Date(hearing.hearingDate).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit"
      })}
    </p>
  </div>
);

export default function Hearings() {
  const [upcoming, setUpcoming]   = useState([]);
  const [past, setPast]           = useState([]);
  const [cases, setCases]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm] = useState({
    caseId: "", hearingDate: "", stage: "", remarks: ""
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [upRes, pastRes, casesRes] = await Promise.allSettled([
        API.get("/hearings/upcoming"),
        API.get("/hearings/past"),
        API.get("/cases"),
      ]);
      if (upRes.status === "fulfilled") {
        const d = upRes.value.data;
        setUpcoming(Array.isArray(d) ? d : d.hearings || []);
      }
      if (pastRes.status === "fulfilled") {
        const d = pastRes.value.data;
        setPast(Array.isArray(d) ? d : d.hearings || []);
      }
      if (casesRes.status === "fulfilled") {
        const d = casesRes.value.data;
        setCases(Array.isArray(d) ? d : d.cases || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.caseId || !form.hearingDate) {
      setError("Case and hearing date are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await API.post("/hearings", form);
      setSuccess("Hearing scheduled successfully!");
      setForm({ caseId: "", hearingDate: "", stage: "", remarks: "" });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule hearing.");
    } finally {
      setSubmitting(false);
    }
  };

  const stages = [
    "First Hearing", "Bail Hearing", "Evidence", "Arguments",
    "Judgment", "Appeal", "Final Order"
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6 max-w-4xl">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Hearing Scheduler
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {upcoming.length} upcoming · {past.length} past
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              {showForm ? "Cancel" : "+ Schedule Hearing"}
            </button>
          </div>

          {/* Add Hearing Form */}
          {showForm && (
            <div className="bg-white border rounded-lg p-5 mb-6 shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">
                Schedule New Hearing
              </h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Case *
                    </label>
                    <select
                      name="caseId"
                      value={form.caseId}
                      onChange={handleChange}
                      className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="">Select a case</option>
                      {cases.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.caseTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Hearing Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="hearingDate"
                      value={form.hearingDate}
                      onChange={handleChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Stage
                    </label>
                    <select
                      name="stage"
                      value={form.stage}
                      onChange={handleChange}
                      className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="">Select stage</option>
                      {stages.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Remarks
                    </label>
                    <input
                      type="text"
                      name="remarks"
                      value={form.remarks}
                      onChange={handleChange}
                      placeholder="Optional notes"
                      className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-900 text-white px-6 py-2 rounded text-sm font-medium disabled:opacity-50 hover:bg-blue-800 transition-colors"
                >
                  {submitting ? "Scheduling..." : "Schedule Hearing"}
                </button>
              </form>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">
              {success}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {["upcoming", "past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-blue-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "upcoming"
                  ? `Upcoming (${upcoming.length})`
                  : `Past (${past.length})`}
              </button>
            ))}
          </div>

          {/* Hearing List */}
          {loading ? (
            <p className="text-gray-400 text-sm py-8 text-center">
              Loading hearings...
            </p>
          ) : activeTab === "upcoming" ? (
            upcoming.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-400 text-sm">No upcoming hearings.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-3 text-blue-600 text-sm hover:underline"
                >
                  Schedule one now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((h) => (
                  <HearingCard key={h._id} hearing={h} past={false} />
                ))}
              </div>
            )
          ) : (
            past.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-400 text-sm">No past hearings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {past.map((h) => (
                  <HearingCard key={h._id} hearing={h} past={true} />
                ))}
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}