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

export const getPracticeTopics = async () => {
  const response = await api.get("/practice/topics");
  return response.data;
};

export const getPracticeCompanies = async () => {
  const response = await api.get("/practice/companies");
  return response.data;
};

export const startPracticeSession = async (sessionData) => {
  const response = await api.post(
    "/practice/session/start",
    sessionData
  );

  return response.data;
};

export const submitPracticeSession = async (
  sessionId,
  answers
) => {
  const response = await api.post(
    `/practice/sessions/${sessionId}/submit`,
    {
      answers,
    }
  );

  return response.data;
};

export const getPracticeSession = async (sessionId) => {
  const response = await api.get(
    `/practice/sessions/${sessionId}`
  );

  return response.data;
};

export const finishPracticeSession = async (sessionId) => {
  const response = await api.post(
    `/practice/sessions/${sessionId}/finish`
  );

  return response.data;
};

export const getPracticeSessionResult = async (sessionId) => {
  const response = await api.get(
    `/practice/sessions/${sessionId}/result`
  );

  return response.data;
};