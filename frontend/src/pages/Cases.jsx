import { useEffect, useState } from "react";
import { getCases } from "../services/caseService";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

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

export default function Cases() {
  const [cases, setCases]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    let result = cases;
    if (search.trim()) {
      result = result.filter(c =>
        c.caseTitle.toLowerCase().includes(search.toLowerCase()) ||
        (c.courtName || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.caseNumber || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(c => c.status === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, cases]);

  const loadCases = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCases();
      const data = Array.isArray(res.data) ? res.data : res.data.cases || res.data.data || [];
      setCases(data);
      setFiltered(data);
    } catch (err) {
      setError("Failed to load cases. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

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

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Cases</h1>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <input
              type="text"
              placeholder="Search by title, court, case number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading cases...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {cases.length === 0 ? "No cases found." : "No cases match your search."}
            </div>
          ) : (
            <div className="bg-white shadow rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Case Title</th>
                    <th className="px-4 py-3 font-medium">Case No.</th>
                    <th className="px-4 py-3 font-medium">Court</th>
                    <th className="px-4 py-3 font-medium">Next Hearing</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {c.caseTitle}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.caseNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.courtName || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(c.nextHearingDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.stage || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/cases/${c._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 text-xs text-gray-400 border-t">
                Showing {filtered.length} of {cases.length} cases
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}