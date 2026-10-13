import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkHealth, uploadFile, getSampleDocuments, getSavedDocuments } from '../services/api';

const StudyContext = createContext(null);

export const StudyProvider = ({ children }) => {
  const [activeDocument, setActiveDocument] = useState(null);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [backendStatus, setBackendStatus] = useState({
    online: false,
    geminiConfigured: false,
    supabaseConfigured: false,
    loading: true
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize: check health, pre-load saved or sample document list
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const health = await checkHealth();
        const isSupabase = Boolean(health?.supabaseConfigured);
        const isGemini = Boolean(health?.geminiConfigured);

        if (isMounted) {
          setBackendStatus({
            online: health.status === 'online',
            geminiConfigured: isGemini,
            supabaseConfigured: isSupabase,
            loading: false
          });
        }

        let loadedDocs = [];

        // Try loading persistent documents from Supabase first
        if (isSupabase) {
          try {
            const savedRes = await getSavedDocuments();
            if (savedRes?.documents && savedRes.documents.length > 0) {
              loadedDocs = savedRes.documents;
            }
          } catch (supaErr) {
            console.warn('Could not load Supabase documents:', supaErr.message);
          }
        }

        // Fetch sample documents for fallbacks
        const sampleRes = await getSampleDocuments();
        const samples = sampleRes?.samples || [];

        if (isMounted) {
          const combined = [...loadedDocs, ...samples];
          if (combined.length > 0) {
            setActiveDocument(combined[0]);
            setRecentDocuments(combined);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Backend initialization warning:', err.message);
          setBackendStatus({ online: false, geminiConfigured: false, supabaseConfigured: false, loading: false });
        }
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError(null);
    try {
      const res = await uploadFile(file);
      if (res?.document) {
        setActiveDocument(res.document);
        setRecentDocuments((prev) => {
          const filtered = prev.filter((d) => d.id !== res.document.id);
          return [res.document, ...filtered];
        });
        return res.document;
      }
    } catch (err) {
      setError(err.message || 'Failed to upload document.');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const loadSampleDoc = async (sample) => {
    setActiveDocument(sample);
    setRecentDocuments((prev) => {
      const filtered = prev.filter((d) => d.id !== sample.id);
      return [sample, ...filtered];
    });
  };

  const removeDocument = (docId) => {
    setRecentDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (activeDocument?.id === docId) {
      const remaining = recentDocuments.filter((d) => d.id !== docId);
      setActiveDocument(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const value = {
    activeDocument,
    setActiveDocument,
    recentDocuments,
    activeTab,
    setActiveTab,
    backendStatus,
    isUploading,
    error,
    setError,
    handleUpload,
    loadSampleDoc,
    removeDocument
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};

export default StudyContext;
