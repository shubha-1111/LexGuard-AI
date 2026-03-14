import { useEffect, useState } from "react";
import { getCases } from "../services/caseService";
import { Link } from "react-router-dom";

export default function Cases() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const res = await getCases();
      setCases(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Cases</h1>

        <Link
          to="/cases/new"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          New Case
        </Link>
      </div>

      <div className="grid gap-4">
        {cases.map((c) => (
          <div key={c._id} className="border p-4 rounded">
            <h2 className="font-semibold">{c.caseTitle}</h2>
            <p>Client: {c.clientName}</p>
            <p>Status: {c.status}</p>

            <Link
              to={`/cases/${c._id}`}
              className="text-blue-600"
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}