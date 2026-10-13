import { getSupabaseClient, getSupabaseBucketName, isSupabaseConfigured } from '../config/supabase.js';

/**
 * Upload a file buffer to Supabase Storage
 * @param {object} file - Multer file object
 * @param {string} documentId - Unique document ID
 * @returns {Promise<{ storagePath: string, publicUrl: string } | null>}
 */
export const uploadFileToStorage = async (file, documentId) => {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const bucket = getSupabaseBucketName();
    const cleanFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `documents/${documentId}_${cleanFilename}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.warn('Supabase Storage upload warning:', uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    return {
      storagePath,
      publicUrl: urlData?.publicUrl || ''
    };
  } catch (err) {
    console.warn('Failed to upload file to Supabase Storage:', err.message);
    return null;
  }
};

/**
 * Download a file buffer from Supabase Storage
 * @param {string} storagePath - Storage path in bucket
 * @returns {Promise<Buffer | null>}
 */
export const downloadFileFromStorage = async (storagePath) => {
  if (!isSupabaseConfigured() || !storagePath) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const bucket = getSupabaseBucketName();
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(storagePath);

    if (error || !data) {
      console.warn('Supabase Storage download error:', error?.message);
      return null;
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.warn('Failed to download from Supabase Storage:', err.message);
    return null;
  }
};

/**
 * Save document metadata to Supabase 'documents' table
 * @param {object} docMetadata
 * @returns {Promise<object | null>}
 */
export const saveDocumentRecord = async (docMetadata) => {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const payload = {
      id: docMetadata.id,
      filename: docMetadata.filename,
      mimetype: docMetadata.mimetype,
      size: docMetadata.size,
      page_count: docMetadata.pageCount || 1,
      word_count: docMetadata.wordCount || 0,
      text_preview: docMetadata.textPreview || '',
      storage_path: docMetadata.storagePath || null,
      public_url: docMetadata.publicUrl || null,
      created_at: docMetadata.uploadedAt || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('documents')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.warn('Supabase DB saveDocument error:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Supabase DB saveDocument exception:', err.message);
    return null;
  }
};

/**
 * Retrieve recent documents from Supabase
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const fetchRecentDocuments = async (limit = 20) => {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Supabase fetchRecentDocuments error:', error.message);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      filename: row.filename,
      mimetype: row.mimetype,
      size: row.size,
      pageCount: row.page_count,
      wordCount: row.word_count,
      textPreview: row.text_preview,
      storagePath: row.storage_path,
      publicUrl: row.public_url,
      uploadedAt: row.created_at,
      isSample: false
    }));
  } catch (err) {
    console.warn('Supabase fetchRecentDocuments exception:', err.message);
    return [];
  }
};

/**
 * Retrieve document by ID from Supabase
 * @param {string} documentId
 * @returns {Promise<object | null>}
 */
export const fetchDocumentRecord = async (documentId) => {
  if (!isSupabaseConfigured() || !documentId) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      filename: data.filename,
      mimetype: data.mimetype,
      size: data.size,
      pageCount: data.page_count,
      wordCount: data.word_count,
      textPreview: data.text_preview,
      storagePath: data.storage_path,
      publicUrl: data.public_url,
      uploadedAt: data.created_at,
      isSample: false
    };
  } catch (err) {
    console.warn('Supabase fetchDocumentRecord exception:', err.message);
    return null;
  }
};

/**
 * Save chat message to Supabase
 * @param {object} params - { documentId, role, content }
 * @returns {Promise<object | null>}
 */
export const saveChatMessage = async ({ documentId, role, content }) => {
  if (!isSupabaseConfigured() || !documentId || !content) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('chat_history')
      .insert({
        document_id: documentId,
        role,
        content,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.warn('Supabase saveChatMessage error:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Supabase saveChatMessage exception:', err.message);
    return null;
  }
};

/**
 * Fetch chat history for document
 * @param {string} documentId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const fetchChatHistory = async (documentId, limit = 50) => {
  if (!isSupabaseConfigured() || !documentId) return [];

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.warn('Supabase fetchChatHistory error:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn('Supabase fetchChatHistory exception:', err.message);
    return [];
  }
};

/**
 * Save summary to Supabase
 * @param {object} params
 * @returns {Promise<object | null>}
 */
export const saveSummaryRecord = async ({ documentId, style, focusTopic, summaryText, keyTakeaways = [] }) => {
  if (!isSupabaseConfigured() || !documentId || !summaryText) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('summaries')
      .insert({
        document_id: documentId,
        style,
        focus_topic: focusTopic || null,
        summary_text: summaryText,
        key_takeaways: keyTakeaways,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.warn('Supabase saveSummaryRecord error:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Supabase saveSummaryRecord exception:', err.message);
    return null;
  }
};

/**
 * Fetch summaries for document
 * @param {string} documentId
 * @returns {Promise<Array>}
 */
export const fetchSummaries = async (documentId) => {
  if (!isSupabaseConfigured() || !documentId) return [];

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchSummaries error:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn('Supabase fetchSummaries exception:', err.message);
    return [];
  }
};

/**
 * Save quiz result to Supabase
 * @param {object} params
 * @returns {Promise<object | null>}
 */
export const saveQuizResultRecord = async ({ documentId, difficulty, score, totalQuestions, questions = [] }) => {
  if (!isSupabaseConfigured() || !documentId) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        document_id: documentId,
        difficulty,
        score,
        total_questions: totalQuestions,
        questions,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.warn('Supabase saveQuizResultRecord error:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Supabase saveQuizResultRecord exception:', err.message);
    return null;
  }
};

export default {
  uploadFileToStorage,
  downloadFileFromStorage,
  saveDocumentRecord,
  fetchRecentDocuments,
  fetchDocumentRecord,
  saveChatMessage,
  fetchChatHistory,
  saveSummaryRecord,
  fetchSummaries,
  saveQuizResultRecord
};
