
import './env.js';
import { GoogleGenAI } from '@google/genai';

/**
 * Get the current Gemini API Key from environment variables
 * @returns {string}
 */
export const getApiKey = () => {
  return (process.env.GEMINI_API_KEY || '').trim();
};

/**
 * Get the target Gemini Model from environment variables
 * @returns {string}
 */
export const getModelName = () => {
  return (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
};

/**
 * Check if a valid Gemini API key is configured
 * @returns {boolean}
 */
export const isGeminiConfigured = () => {
  const key = getApiKey();
  const placeholders = ['your_gemini_api_key_here', 'your_actual_gemini_api_key_here', ''];
  return Boolean(key && !placeholders.includes(key) && key.length > 10);
};

/**
 * Get the official @google/genai client instance
 * @returns {GoogleGenAI}
 */
export const getGeminiClient = () => {
  if (!isGeminiConfigured()) {
    throw new Error('GEMINI_API_KEY is missing or invalid. Please check backend/.env');
  }

  const apiKey = getApiKey();
  return new GoogleGenAI({ apiKey });
};

export default {
  getApiKey,
  getModelName,
  isGeminiConfigured,
  getGeminiClient
};
