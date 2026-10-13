import { ensureDocumentLoaded } from '../services/fileService.js';
import { generateQuizFromDocument, generateFlashcardsFromDocument } from '../services/geminiService.js';
import { isSupabaseConfigured, getSupabaseClient } from '../config/supabase.js';
import { saveQuizResultRecord } from '../services/supabaseService.js';

export const handleGenerateQuiz = async (req, res, next) => {
  try {
    const { documentId, count = 5, difficulty = 'medium', focusTopic = '' } = req.body;

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

    const questions = await generateQuizFromDocument({
      document,
      count: parseInt(count, 10) || 5,
      difficulty,
      focusTopic
    });

    return res.json({
      success: true,
      data: {
        documentId,
        difficulty,
        totalQuestions: questions.length,
        questions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const handleGenerateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 6, focusTopic = '' } = req.body;

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

    const flashcards = await generateFlashcardsFromDocument({
      document,
      count: parseInt(count, 10) || 6,
      focusTopic
    });

    return res.json({
      success: true,
      data: {
        documentId,
        totalFlashcards: flashcards.length,
        flashcards
      }
    });
  } catch (error) {
    next(error);
  }
};

export const handleSaveQuizResult = async (req, res, next) => {
  try {
    const { documentId, difficulty, score, totalQuestions, questions } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, error: 'Document ID is required.' });
    }

    let saved = null;
    if (isSupabaseConfigured()) {
      saved = await saveQuizResultRecord({
        documentId,
        difficulty: difficulty || 'medium',
        score: score || 0,
        totalQuestions: totalQuestions || 0,
        questions: questions || []
      });
    }

    return res.json({
      success: true,
      persisted: Boolean(saved),
      data: saved || { documentId, score, totalQuestions }
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetQuizResults = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    if (!documentId) {
      return res.status(400).json({ success: false, error: 'Document ID required.' });
    }

    if (!isSupabaseConfigured()) {
      return res.json({ success: true, results: [] });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      results: data || []
    });
  } catch (error) {
    next(error);
  }
};

export default {
  handleGenerateQuiz,
  handleGenerateFlashcards,
  handleSaveQuizResult,
  handleGetQuizResults
};
