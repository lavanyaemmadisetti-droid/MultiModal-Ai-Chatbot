import { ensureDocumentLoaded } from '../services/fileService.js';
import { summarizeDocument } from '../services/geminiService.js';
import { isSupabaseConfigured } from '../config/supabase.js';
import { saveSummaryRecord, fetchSummaries } from '../services/supabaseService.js';

export const handleSummarize = async (req, res, next) => {
  try {
    const { documentId, style = 'detailed', focusTopic = '' } = req.body;

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

    const result = await summarizeDocument({
      document,
      style,
      focusTopic
    });

    // Asynchronously save summary to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await saveSummaryRecord({
          documentId,
          style,
          focusTopic,
          summaryText: result.summary,
          keyTakeaways: result.keyTakeaways || []
        });
      } catch (dbErr) {
        console.warn('Supabase summary persistence warning:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      data: {
        ...result,
        style,
        documentId
      }
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetSummaries = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    if (!documentId) {
      return res.status(400).json({ success: false, error: 'Document ID required.' });
    }

    const list = await fetchSummaries(documentId);
    return res.json({
      success: true,
      summaries: list
    });
  } catch (error) {
    next(error);
  }
};

export default {
  handleSummarize,
  handleGetSummaries
};
