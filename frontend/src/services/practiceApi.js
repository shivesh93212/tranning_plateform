import api from "./api";

export const getPracticeQuestions = async (params = {}) => {
  const response = await api.get("/practice/questions", {
    params,
  });

  return response.data;
};

export const submitAttempt = async (attemptData) => {
  const response = await api.post("/practice/attempt", attemptData);

  return response.data;
};

export const getAttemptResult = async (attemptId) => {
  const response = await api.get(
    `/practice/attempts/${attemptId}/result`
  );

  return response.data;
};