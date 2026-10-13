import { ensureDocumentLoaded } from '../services/fileService.js';
import { askQuestionAboutDocument } from '../services/geminiService.js';
import { isSupabaseConfigured } from '../config/supabase.js';
import { saveChatMessage, fetchChatHistory } from '../services/supabaseService.js';

export const handleChat = async (req, res, next) => {
  try {
    const { documentId, question, chatHistory } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Question is required.'
      });
    }

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Please upload or select a document first.'
      });
    }

    const document = await ensureDocumentLoaded(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or expired. Please re-upload your document.'
      });
    }

    const result = await askQuestionAboutDocument({
      document,
      question: question.trim(),
      chatHistory: Array.isArray(chatHistory) ? chatHistory : []
    });

    // Asynchronously save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await saveChatMessage({
          documentId,
          role: 'user',
          content: question.trim()
        });
        if (result?.answer) {
          await saveChatMessage({
            documentId,
            role: 'assistant',
            content: result.answer
          });
        }
      } catch (dbErr) {
        console.warn('Supabase chat persistence warning:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    if (!documentId) {
      return res.status(400).json({ success: false, error: 'Document ID required.' });
    }

    const history = await fetchChatHistory(documentId);
    return res.json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
};

export default {
  handleChat,
  handleGetChatHistory
};
