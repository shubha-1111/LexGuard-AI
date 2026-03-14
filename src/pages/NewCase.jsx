import { useState } from "react";
import { createCase } from "../services/caseService";
import { useNavigate } from "react-router-dom";

export default function NewCase() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    caseTitle: "",
    clientName: "",
    caseType: "",
    status: "Active",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createCase(form);
      navigate("/cases");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Create Case</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          name="caseTitle"
          placeholder="Case Title"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="clientName"
          placeholder="Client Name"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="caseType"
          placeholder="Case Type"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Case
        </button>

      </form>
    </div>
  );
}