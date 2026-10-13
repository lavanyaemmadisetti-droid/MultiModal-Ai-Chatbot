import pdfParse from 'pdf-parse';
import crypto from 'crypto';
import { isSupabaseConfigured } from '../config/supabase.js';
import {
  uploadFileToStorage,
  downloadFileFromStorage,
  saveDocumentRecord,
  fetchRecentDocuments,
  fetchDocumentRecord
} from './supabaseService.js';

// In-memory document store (key: documentId, value: doc info + base64)
const documentStore = new Map();

// Sample study document for instant demo testing
const SAMPLE_DOCS = {
  sample_ai_intro: {
    id: 'sample_ai_intro',
    filename: 'Introduction_to_Neural_Networks.pdf',
    mimetype: 'text/plain',
    size: 4200,
    pageCount: 3,
    wordCount: 780,
    uploadedAt: new Date().toISOString(),
    isSample: true,
    textPreview: `Neural Networks and Deep Learning: A Study Guide for Computer Science Students...`,
    content: `INTRODUCTION TO NEURAL NETWORKS & DEEP LEARNING

1. FOUNDATIONAL CONCEPTS
An artificial neural network (ANN) is a computational model inspired by biological neural networks in the human brain. The fundamental building block is an artificial neuron (perceptron).
A neuron receives inputs x1, x2, ..., xn, multiplies each input by its associated weight w1, w2, ..., wn, sums them with a bias term b, and passes the result through an activation function:
y = f(sum(w_i * x_i) + b)

2. ACTIVATION FUNCTIONS
Activation functions introduce non-linearity into the network, allowing it to learn complex mappings:
- Sigmoid: f(x) = 1 / (1 + e^-x). Maps values between (0, 1). Susceptible to the vanishing gradient problem.
- Tanh: f(x) = (e^x - e^-x) / (e^x + e^-x). Zero-centered, ranges from (-1, 1).
- ReLU (Rectified Linear Unit): f(x) = max(0, x). Computationally efficient and mitigates vanishing gradients for positive inputs. Most commonly used in hidden layers.
- Softmax: Used in multi-class classification output layers to convert raw logits into probability distributions that sum to 1.

3. FORWARD PROPAGATION & LOSS FUNCTIONS
Forward propagation computes the output by transmitting input signals through layers of interconnected neurons.
The difference between predicted output and ground-truth target is quantified by a Loss Function:
- Mean Squared Error (MSE): Used for regression tasks.
- Cross-Entropy Loss: Used for classification tasks.

4. BACKPROPAGATION & GRADIENT DESCENT
Backpropagation calculates the gradient of the loss function with respect to each weight using the Chain Rule of calculus.
Gradient Descent updates network parameters in the opposite direction of the gradient:
w := w - alpha * (dL / dw)
where alpha is the learning rate.
Variants include Stochastic Gradient Descent (SGD), Mini-batch Gradient Descent, and Adam (Adaptive Moment Estimation).

5. OVERFITTING & REGULARIZATION
Overfitting occurs when a model performs exceptionally well on training data but poorly on unseen test data.
Mitigation strategies:
- L1 (Lasso) and L2 (Ridge) weight regularization
- Dropout: Randomly deactivating a fraction of neurons during training
- Early Stopping: Halting training when validation loss begins to rise
- Data Augmentation: Synthetically expanding training datasets`
  }
};

/**
 * Process an uploaded Multer file
 * @param {object} file - Multer file object
 * @returns {Promise<object>}
 */
export const processUploadedFile = async (file) => {
  const documentId = crypto.randomUUID();
  const base64Data = file.buffer.toString('base64');
  let extractedText = '';
  let pageCount = 1;

  if (file.mimetype === 'application/pdf') {
    try {
      const pdfData = await pdfParse(file.buffer);
      extractedText = pdfData.text || '';
      pageCount = pdfData.numpages || 1;
    } catch (err) {
      console.warn('PDF text extraction fallback (Gemini native vision will still parse this):', err.message);
    }
  }

  const wordCount = extractedText ? extractedText.trim().split(/\s+/).length : 0;
  const textPreview = extractedText ? extractedText.slice(0, 500) + '...' : '';

  let storagePath = null;
  let publicUrl = null;

  // If Supabase is configured, upload file to Supabase Storage
  if (isSupabaseConfigured()) {
    try {
      const storageResult = await uploadFileToStorage(file, documentId);
      if (storageResult) {
        storagePath = storageResult.storagePath;
        publicUrl = storageResult.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase storage upload error:', err.message);
    }
  }

  const docMetadata = {
    id: documentId,
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    pageCount,
    wordCount,
    textPreview,
    storagePath,
    publicUrl,
    uploadedAt: new Date().toISOString(),
    isSample: false
  };

  // If Supabase is configured, persist metadata in Supabase DB
  if (isSupabaseConfigured()) {
    try {
      await saveDocumentRecord(docMetadata);
    } catch (err) {
      console.warn('Supabase document record save error:', err.message);
    }
  }

  // Cache in-memory
  documentStore.set(documentId, {
    ...docMetadata,
    base64Data,
    extractedText
  });

  // Keep store size manageable (limit to latest 30 documents)
  if (documentStore.size > 30) {
    const oldestKey = documentStore.keys().next().value;
    documentStore.delete(oldestKey);
  }

  return docMetadata;
};

/**
 * Retrieve document synchronously by ID (from memory or sample docs)
 * @param {string} documentId
 * @returns {object|null}
 */
export const getDocumentById = (documentId) => {
  if (SAMPLE_DOCS[documentId]) {
    return SAMPLE_DOCS[documentId];
  }
  return documentStore.get(documentId) || null;
};

/**
 * Ensure document is loaded into memory, checking Supabase if not present in memory
 * @param {string} documentId
 * @returns {Promise<object|null>}
 */
export const ensureDocumentLoaded = async (documentId) => {
  const inMem = getDocumentById(documentId);
  if (inMem) return inMem;

  if (isSupabaseConfigured()) {
    try {
      const record = await fetchDocumentRecord(documentId);
      if (record && record.storagePath) {
        const fileBuffer = await downloadFileFromStorage(record.storagePath);
        if (fileBuffer) {
          const base64Data = fileBuffer.toString('base64');
          const doc = {
            ...record,
            base64Data
          };
          documentStore.set(documentId, doc);
          return doc;
        }
      }
      return record;
    } catch (err) {
      console.warn('Could not restore document from Supabase:', err.message);
    }
  }

  return null;
};

/**
 * List all available sample documents
 */
export const getSampleDocuments = () => {
  return Object.values(SAMPLE_DOCS).map(({ id, filename, mimetype, size, pageCount, wordCount, textPreview, isSample }) => ({
    id,
    filename,
    mimetype,
    size,
    pageCount,
    wordCount,
    textPreview,
    isSample
  }));
};

/**
 * List saved documents from Supabase (or empty if not configured)
 */
export const getSavedDocuments = async () => {
  if (!isSupabaseConfigured()) return [];
  return await fetchRecentDocuments();
};

/**
 * Convert document data into Gemini API content part
 * @param {object} doc - Document object with base64Data or buffer
 * @returns {object|string} Gemini part
 */
export const formatDocumentForGemini = (doc) => {
  if (doc.base64Data && doc.mimetype) {
    return {
      inlineData: {
        data: doc.base64Data,
        mimeType: doc.mimetype
      }
    };
  }

  if (doc.content) {
    return `[DOCUMENT CONTENT: ${doc.filename}]\n${doc.content}`;
  }

  if (doc.extractedText) {
    return `[EXTRACTED TEXT FROM: ${doc.filename}]\n${doc.extractedText}`;
  }

  throw new Error('Document content could not be formatted for Gemini processing.');
};

/**
 * Process a file that was uploaded directly to Supabase Storage by the client
 * (Bypasses Vercel Serverless Function 4.5MB request payload limit)
 * @param {object} params - { documentId, filename, mimetype, size, storagePath, publicUrl }
 * @returns {Promise<object>}
 */
export const processSupabaseStoredFile = async ({ documentId, filename, mimetype, size, storagePath, publicUrl }) => {
  const docId = documentId || crypto.randomUUID();
  let extractedText = '';
  let pageCount = 1;
  let base64Data = '';

  // Download file buffer from Supabase to parse and prepare for Gemini
  if (storagePath) {
    try {
      const fileBuffer = await downloadFileFromStorage(storagePath);
      if (fileBuffer) {
        base64Data = fileBuffer.toString('base64');
        if (mimetype === 'application/pdf') {
          try {
            const pdfData = await pdfParse(fileBuffer);
            extractedText = pdfData.text || '';
            pageCount = pdfData.numpages || 1;
          } catch (pdfErr) {
            console.warn('PDF parsing fallback:', pdfErr.message);
          }
        }
      }
    } catch (err) {
      console.warn('Could not download file buffer from Supabase Storage:', err.message);
    }
  }

  const wordCount = extractedText ? extractedText.trim().split(/\s+/).length : 0;
  const textPreview = extractedText ? extractedText.slice(0, 500) + '...' : '';

  const docMetadata = {
    id: docId,
    filename,
    mimetype,
    size: size || 0,
    pageCount,
    wordCount,
    textPreview,
    storagePath,
    publicUrl,
    uploadedAt: new Date().toISOString(),
    isSample: false
  };

  // Persist metadata in Supabase DB if configured
  if (isSupabaseConfigured()) {
    try {
      await saveDocumentRecord(docMetadata);
    } catch (err) {
      console.warn('Supabase document record save error:', err.message);
    }
  }

  // Cache in-memory
  documentStore.set(docId, {
    ...docMetadata,
    base64Data,
    extractedText
  });

  return docMetadata;
};

export default {
  processUploadedFile,
  processSupabaseStoredFile,
  getDocumentById,
  ensureDocumentLoaded,
  getSampleDocuments,
  getSavedDocuments,
  formatDocumentForGemini
};
