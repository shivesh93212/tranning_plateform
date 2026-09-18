import api from "./api";

export const getDashboard = async () => {
  const response = await api.get("/practice/dashboard");
  return response.data;
};