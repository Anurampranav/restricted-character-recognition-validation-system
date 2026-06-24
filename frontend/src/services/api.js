import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 120000,
});

export async function uploadCharacterImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getHistory() {
  const response = await api.get("/history");
  return response.data.items || [];
}

export async function getStats() {
  const response = await api.get("/stats");
  return response.data;
}

export async function getAllowedDataset() {
  const response = await api.get("/allowed");
  return response.data;
}

export function getFriendlyApiError(error) {
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error?.code === "ERR_NETWORK") {
    return "Backend unavailable. Start the FastAPI server on http://localhost:8000.";
  }
  if (error?.code === "ECONNABORTED") {
    return "Image analysis timed out. Please try again with a clearer image.";
  }
  return error?.message || "The request could not be completed.";
}
