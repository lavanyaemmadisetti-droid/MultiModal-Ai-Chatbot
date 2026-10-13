import multer from 'multer';

/**
 * Redact any potential API key occurrences in error messages
 */
const sanitizeErrorMessage = (message) => {
  if (!message || typeof message !== 'string') return 'An error occurred';
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (apiKey && apiKey.length > 5) {
    return message.replaceAll(apiKey, '[REDACTED_API_KEY]');
  }
  return message;
};

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  const safeMessage = sanitizeErrorMessage(err.message);
  console.error('[Error Details]:', safeMessage);

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File size too large. Maximum allowed size is 25 MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${safeMessage}`
    });
  }

  // Handle Missing or Invalid Gemini API Key
  if (safeMessage.includes('GEMINI_API_KEY')) {
    return res.status(401).json({
      success: false,
      error: 'Google Gemini API key is missing or invalid. Please configure GEMINI_API_KEY in backend/.env',
      code: 'API_KEY_REQUIRED'
    });
  }

  // Handle Gemini Quota or Rate Limit errors
  if (err.status === 429 || safeMessage.includes('429')) {
    return res.status(429).json({
      success: false,
      error: 'Gemini API rate limit reached. Please wait a few moments and try again.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }

  // Default response
  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: safeMessage || 'An unexpected error occurred while processing your request.',
    code: err.code || 'INTERNAL_ERROR'
  });
};

export default errorHandler;
