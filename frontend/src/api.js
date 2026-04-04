import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Fetch raw source code of a file inside an analysis
export const fetchFileCode = async (analysisId, filepath) => {
  const res = await API.get(`/analyses/${analysisId}/file`, {
    params: { filepath },
  });
  return res.data;   // plain text
};

export const explainNode = async (analysisId, nodeId, code, nodeType) => {
  const res = await API.post(`/analyses/${analysisId}/explain`, {
    node_id:   nodeId,
    code:      code,
    node_type: nodeType,
  });
  return res.data.summary;
};

export default API;