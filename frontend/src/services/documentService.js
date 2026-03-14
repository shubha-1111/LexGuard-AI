import axios from "./api";

export const uploadDocument = (caseId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(`/documents/${caseId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

export const getDocuments = (caseId) => {
  return axios.get(`/documents/case/${caseId}`);
};