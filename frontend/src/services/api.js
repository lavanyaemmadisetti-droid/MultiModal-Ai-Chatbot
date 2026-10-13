const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Handle HTTP response and standardized errors
 */
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { error: await response.text() };
  }

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
};

/**
 * Check backend connection and Gemini configuration
 */
export const checkHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await handleResponse(res);
  } catch (err) {
    console.warn('Backend health check error:', err.message);
    return { status: 'offline', geminiConfigured: false, error: err.message };
  }
};

/**
 * Upload a PDF or Image file
 * @param {File} file
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });

  return await handleResponse(res);
};

/**
 * Get sample study documents
 */
export const getSampleDocuments = async () => {
  const res = await fetch(`${API_BASE}/upload/samples`);
  return await handleResponse(res);
};

/**
 * Get document metadata by ID
 * @param {string} id
 */
export const getDocument = async (id) => {
  const res = await fetch(`${API_BASE}/upload/${id}`);
  return await handleResponse(res);
};

/**
 * Ask a question about an uploaded document
 * @param {object} params - { documentId, question, chatHistory }
 */
export const askQuestion = async ({ documentId, question, chatHistory = [] }) => {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, question, chatHistory })
  });

  return await handleResponse(res);
};

/**
 * Generate a summary for a document
 * @param {object} params - { documentId, style, focusTopic }
 */
export const generateSummary = async ({ documentId, style = 'detailed', focusTopic = '' }) => {
  const res = await fetch(`${API_BASE}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, style, focusTopic })
  });

  return await handleResponse(res);
};

/**
 * Generate an interactive quiz
 * @param {object} params - { documentId, count, difficulty, focusTopic }
 */
export const generateQuiz = async ({ documentId, count = 5, difficulty = 'medium', focusTopic = '' }) => {
  const res = await fetch(`${API_BASE}/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, count, difficulty, focusTopic })
  });

  return await handleResponse(res);
};

/**
 * Generate flashcards
 * @param {object} params - { documentId, count, focusTopic }
 */
export const generateFlashcards = async ({ documentId, count = 6, focusTopic = '' }) => {
  const res = await fetch(`${API_BASE}/quiz/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, count, focusTopic })
  });

  return await handleResponse(res);
};

/**
 * Get saved documents from Supabase
 */
export const getSavedDocuments = async () => {
  const res = await fetch(`${API_BASE}/upload/saved`);
  return await handleResponse(res);
};

/**
 * Get chat history for a document from Supabase
 * @param {string} documentId
 */
export const getChatHistory = async (documentId) => {
  const res = await fetch(`${API_BASE}/chat/history/${encodeURIComponent(documentId)}`);
  return await handleResponse(res);
};

/**
 * Get saved summaries for a document from Supabase
 * @param {string} documentId
 */
export const getSummaries = async (documentId) => {
  const res = await fetch(`${API_BASE}/summarize/history/${encodeURIComponent(documentId)}`);
  return await handleResponse(res);
};

/**
 * Save quiz results to Supabase
 * @param {object} params - { documentId, difficulty, score, totalQuestions, questions }
 */
export const saveQuizResult = async (params) => {
  const res = await fetch(`${API_BASE}/quiz/save-result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  return await handleResponse(res);
};

/**
 * Get quiz history for a document from Supabase
 * @param {string} documentId
 */
export const getQuizResults = async (documentId) => {
  const res = await fetch(`${API_BASE}/quiz/history/${encodeURIComponent(documentId)}`);
  return await handleResponse(res);
};

export default {
  checkHealth,
  uploadFile,
  getSampleDocuments,
  getSavedDocuments,
  getDocument,
  askQuestion,
  getChatHistory,
  generateSummary,
  getSummaries,
  generateQuiz,
  saveQuizResult,
  getQuizResults,
  generateFlashcards
};
