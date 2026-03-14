import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCaseById } from "../services/caseService";
import { uploadDocument, getDocuments } from "../services/documentService";

export default function CaseDetails() {
  const { id } = useParams();

  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchCase();
    fetchDocuments();
  }, []);

  const fetchCase = async () => {
    try {
      const res = await getCaseById(id);
      setCaseData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await getDocuments(id);
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) return;

    try {
      await uploadDocument(id, file);
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  if (!caseData) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        {caseData.caseTitle}
      </h1>

      <div className="space-y-2">
        <p><strong>Client:</strong> {caseData.clientName}</p>
        <p><strong>Case Type:</strong> {caseData.caseType}</p>
        <p><strong>Status:</strong> {caseData.status}</p>
      </div>

      <div className="mt-8 border-t pt-6">

        <h2 className="text-xl font-semibold mb-4">
          Upload Document
        </h2>

        <form onSubmit={handleUpload} className="flex gap-4">

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Upload
          </button>

        </form>

      </div>

      <div className="mt-8">

        <h2 className="text-xl font-semibold mb-4">
          Documents
        </h2>

        {documents.length === 0 && (
          <p>No documents uploaded.</p>
        )}

        {documents.map((doc) => (
          <div key={doc._id} className="border p-3 rounded mb-2">
            {doc.filename}
          </div>
        ))}

      </div>

    </div>
  );
}