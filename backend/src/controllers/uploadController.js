import {
  processUploadedFile,
  getDocumentById,
  ensureDocumentLoaded,
  getSampleDocuments,
  getSavedDocuments
} from '../services/fileService.js';

export const handleFileUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please select a PDF or image file (PNG, JPG, WEBP).'
      });
    }

    const documentMetadata = await processUploadedFile(req.file);

    return res.status(201).json({
      success: true,
      message: 'File uploaded and processed successfully.',
      document: documentMetadata
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await ensureDocumentLoaded(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or session expired. Please re-upload your document.'
      });
    }

    return res.json({
      success: true,
      document: {
        id: doc.id,
        filename: doc.filename,
        mimetype: doc.mimetype,
        size: doc.size,
        pageCount: doc.pageCount,
        wordCount: doc.wordCount,
        textPreview: doc.textPreview,
        storagePath: doc.storagePath,
        publicUrl: doc.publicUrl,
        isSample: Boolean(doc.isSample),
        uploadedAt: doc.uploadedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetSampleDocuments = (req, res, next) => {
  try {
    const samples = getSampleDocuments();
    return res.json({
      success: true,
      samples
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetSavedDocuments = async (req, res, next) => {
  try {
    const saved = await getSavedDocuments();
    return res.json({
      success: true,
      documents: saved
    });
  } catch (error) {
    next(error);
  }
};

export default {
  handleFileUpload,
  handleGetDocument,
  handleGetSampleDocuments,
  handleGetSavedDocuments
};
