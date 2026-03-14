import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";
import { Link } from "react-router-dom";

const StatCard = ({ label, value, color }) => (
  <div className="bg-white shadow rounded p-5">
    <h2 className="text-gray-500 text-sm mb-1">{label}</h2>
    <p className={`text-3xl font-bold ${color || "text-gray-800"}`}>
      {value ?? "—"}
    </p>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    open:    "bg-green-100 text-green-800",
    closed:  "bg-gray-100 text-gray-600",
    pending: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  const [cases, setCases]         = useState([]);
  const [hearings, setHearings]   = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [casesRes, hearingsRes, deadlinesRes] = await Promise.allSettled([
        API.get("/cases"),
        API.get("/hearings/upcoming"),
        API.get("/deadlines/upcoming"),
      ]);

    if (casesRes.status === "fulfilled") {
        const data = casesRes.value.data;
        setCases(Array.isArray(data) ? data : data.cases || data.data || []);
    }
    if (hearingsRes.status === "fulfilled") {
        const data = hearingsRes.value.data;
        setHearings(Array.isArray(data) ? data : data.hearings || data.data || []);
    }
    if (deadlinesRes.status === "fulfilled") {
        const data = deadlinesRes.value.data;
        setDeadlines(Array.isArray(data) ? data : data.deadlines || data.data || []);
    }
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const openCases    = cases.filter(c => c.status === "open").length;
  const pendingCases = cases.filter(c => c.status === "pending").length;

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">

          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Legal Dashboard
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Cases"    value={loading ? "..." : cases.length} />
            <StatCard label="Open Cases"     value={loading ? "..." : openCases}    color="text-green-600" />
            <StatCard label="Pending Cases"  value={loading ? "..." : pendingCases} color="text-yellow-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Upcoming Hearings */}
            <div className="bg-white shadow rounded p-5">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Upcoming Hearings
              </h2>
              {loading ? (
                <p className="text-gray-400 text-sm">Loading...</p>
              ) : hearings.length === 0 ? (
                <p className="text-gray-400 text-sm">No upcoming hearings.</p>
              ) : (
                <ul className="divide-y">
                  {hearings.slice(0, 5).map((h, i) => (
                    <li key={h._id || i} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {h.caseTitle || h.title || "Hearing"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {h.courtName || ""}
                        </p>
                      </div>
                      <span className="text-xs text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded">
                        {formatDate(h.date || h.hearingDate)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white shadow rounded p-5">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Upcoming Deadlines
              </h2>
              {loading ? (
                <p className="text-gray-400 text-sm">Loading...</p>
              ) : deadlines.length === 0 ? (
                <p className="text-gray-400 text-sm">No upcoming deadlines.</p>
              ) : (
                <ul className="divide-y">
                  {deadlines.slice(0, 5).map((d, i) => (
                    <li key={d._id || i} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {d.title || d.description || "Deadline"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {d.caseTitle || ""}
                        </p>
                      </div>
                      <span className="text-xs text-red-700 font-medium bg-red-50 px-2 py-1 rounded">
                        {formatDate(d.dueDate || d.date)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          {/* Recent Cases */}
          <div className="bg-white shadow rounded p-5 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Recent Cases</h2>
              <Link to="/cases" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : cases.length === 0 ? (
              <p className="text-gray-400 text-sm">No cases found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 font-medium">Case Title</th>
                      <th className="pb-2 font-medium">Court</th>
                      <th className="pb-2 font-medium">Next Hearing</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cases.slice(0, 5).map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">
                          {c.caseTitle}
                        </td>
                        <td className="py-3 text-gray-500">
                          {c.courtName || "—"}
                        </td>
                        <td className="py-3 text-gray-500">
                          {formatDate(c.nextHearingDate)}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3">
                          <Link
                            to={`/cases/${c._id}`}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}