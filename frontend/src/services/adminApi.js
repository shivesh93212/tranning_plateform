import api from "./api";

// =========================
// DASHBOARD
// =========================

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

// =========================
// USERS
// =========================

export const getAdminUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const getAdminUser = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateAdminUserStatus = async (userId, isActive) => {
  const response = await api.patch(
    `/admin/users/${userId}/status`,
    {
      is_active: isActive,
    }
  );

  return response.data;
};

export const getAdminUserSubscription = async (userId) => {
  const response = await api.get(
    `/admin/users/${userId}/subscription`
  );

  return response.data;
};

// =========================
// TOPICS
// =========================

export const getAdminTopics = async () => {
  const response = await api.get("/admin/topics");
  return response.data;
};

export const getAdminTopic = async (topicId) => {
  const response = await api.get(
    `/admin/topics/${topicId}`
  );

  return response.data;
};

export const createAdminTopic = async (data) => {
  const response = await api.post(
    "/admin/topics",
    data
  );

  return response.data;
};

export const updateAdminTopic = async (topicId, data) => {
  const response = await api.patch(
    `/admin/topics/${topicId}`,
    data
  );

  return response.data;
};

export const deleteAdminTopic = async (topicId) => {
  const response = await api.delete(
    `/admin/topics/${topicId}`
  );

  return response.data;
};

// =========================
// SUBTOPICS
// =========================

export const getAdminSubtopics = async (topicId = null) => {
  const response = await api.get(
    "/admin/subtopics",
    {
      params:
        topicId !== null
          ? { topic_id: topicId }
          : {},
    }
  );

  return response.data;
};

export const getAdminSubtopic = async (subtopicId) => {
  const response = await api.get(
    `/admin/subtopics/${subtopicId}`
  );

  return response.data;
};

export const createAdminSubtopic = async (data) => {
  const response = await api.post(
    "/admin/subtopics",
    data
  );

  return response.data;
};

export const updateAdminSubtopic = async (
  subtopicId,
  data
) => {
  const response = await api.patch(
    `/admin/subtopics/${subtopicId}`,
    data
  );

  return response.data;
};

export const deleteAdminSubtopic = async (subtopicId) => {
  const response = await api.delete(
    `/admin/subtopics/${subtopicId}`
  );

  return response.data;
};

// =========================
// COMPANIES
// =========================

export const getAdminCompanies = async () => {
  const response = await api.get("/admin/companies");
  return response.data;
};

export const getAdminCompany = async (companyId) => {
  const response = await api.get(
    `/admin/companies/${companyId}`
  );

  return response.data;
};

export const createAdminCompany = async (data) => {
  const response = await api.post(
    "/admin/companies",
    data
  );

  return response.data;
};

export const updateAdminCompany = async (
  companyId,
  data
) => {
  const response = await api.patch(
    `/admin/companies/${companyId}`,
    data
  );

  return response.data;
};

export const deleteAdminCompany = async (companyId) => {
  const response = await api.delete(
    `/admin/companies/${companyId}`
  );

  return response.data;
};

// =========================
// QUESTIONS
// =========================

export const getAdminQuestions = async (params = {}) => {
  const response = await api.get(
    "/admin/questions",
    {
      params,
    }
  );

  return response.data;
};

export const getAdminQuestion = async (questionId) => {
  const response = await api.get(
    `/admin/questions/${questionId}`
  );

  return response.data;
};

export const createAdminQuestion = async (data) => {
  const response = await api.post(
    "/admin/questions",
    data
  );

  return response.data;
};

export const updateAdminQuestion = async (
  questionId,
  data
) => {
  const response = await api.patch(
    `/admin/questions/${questionId}`,
    data
  );

  return response.data;
};

export const deleteAdminQuestion = async (questionId) => {
  const response = await api.delete(
    `/admin/questions/${questionId}`
  );

  return response.data;
};

// =========================
// SUBSCRIPTIONS
// =========================

export const getAdminSubscriptions = async () => {
  const response = await api.get(
    "/admin/subscriptions"
  );

  return response.data;
};

// =========================
// PAYMENTS
// =========================

export const getAdminPayments = async () => {
  const response = await api.get(
    "/admin/payments"
  );

  return response.data;
};

// =========================
// ANALYTICS
// =========================

export const getAdminAnalytics = async () => {
  const response = await api.get(
    "/admin/analytics"
  );

  return response.data;
};

export const getAdminDSAQuestions = async () => {
  const response = await api.get("/admin/dsa");
  return response.data;
};

export const createAdminDSAQuestion = async (data) => {
  const response = await api.post(
    "/admin/dsa",
    data
  );
  return response.data;
};

export const updateAdminDSAQuestion = async (
  questionId,
  data
) => {
  const response = await api.patch(
    `/admin/dsa/${questionId}`,
    data
  );
  return response.data;
};

export const deleteAdminDSAQuestion = async (
  questionId
) => {
  const response = await api.delete(
    `/admin/dsa/${questionId}`
  );
  return response.data;
};