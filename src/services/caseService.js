import axios from "./api";

export const getCases = () => {
  return axios.get("/cases");
};

export const getCaseById = (id) => {
  return axios.get(`/cases/${id}`);
};

export const createCase = (data) => {
  return axios.post("/cases/create", data);
};

export const updateCase = (id, data) => {
  return axios.put(`/cases/${id}`, data);
};

export const deleteCase = (id) => {
  return axios.delete(`/cases/${id}`);
};