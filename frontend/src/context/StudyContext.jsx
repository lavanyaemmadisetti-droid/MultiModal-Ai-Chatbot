import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkHealth, uploadFile, registerSupabaseFile, getSampleDocuments, getSavedDocuments } from '../services/api';
import { getSupabase, isSupabaseFrontendConfigured, getCurrentUser, onAuthStateChange, signOut } from '../services/supabase';

const StudyContext = createContext(null);

export const StudyProvider = ({ children }) => {
  const [activeDocument, setActiveDocument] = useState(null);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState(null);
  const [backendStatus, setBackendStatus] = useState({
    online: false,
    geminiConfigured: false,
    supabaseConfigured: false,
    loading: true
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize: check health, pre-load saved or sample document list, and listen to auth state
  useEffect(() => {
    let isMounted = true;

    // Check current auth user
    getCurrentUser().then((currentUser) => {
      if (isMounted) setUser(currentUser);
    }).catch(() => {});

    // Subscribe to auth state updates
    const unsubscribeAuth = onAuthStateChange((updatedUser) => {
      if (isMounted) setUser(updatedUser);
    });

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
      if (typeof unsubscribeAuth === 'function') unsubscribeAuth();
    };
  }, []);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError(null);
    try {
      // 1. Direct Supabase Storage upload for large files or persistent storage (Bypasses Vercel 4.5MB limit)
      if (isSupabaseFrontendConfigured()) {
        try {
          const supabase = getSupabase();
          if (supabase) {
            const documentId = crypto.randomUUID();
            const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const storagePath = `documents/${documentId}_${cleanFilename}`;

            const { error: uploadErr } = await supabase.storage
              .from('study-materials')
              .upload(storagePath, file, {
                contentType: file.type,
                upsert: true
              });

            if (!uploadErr) {
              const { data: urlData } = supabase.storage
                .from('study-materials')
                .getPublicUrl(storagePath);

              const res = await registerSupabaseFile({
                documentId,
                filename: file.name,
                mimetype: file.type,
                size: file.size,
                storagePath,
                publicUrl: urlData?.publicUrl || ''
              });

              if (res?.document) {
                setActiveDocument(res.document);
                setRecentDocuments((prev) => {
                  const filtered = prev.filter((d) => d.id !== res.document.id);
                  return [res.document, ...filtered];
                });
                return res.document;
              }
            } else {
              console.warn('Direct Supabase Storage upload warning, falling back to server upload:', uploadErr.message);
            }
          }
        } catch (supaErr) {
          console.warn('Direct Supabase upload attempt failed, falling back to server upload:', supaErr.message);
        }
      }

      // 2. Standard server upload
      if (file.size > 4.5 * 1024 * 1024) {
        throw new Error('File exceeds Vercel serverless upload limit (4.5 MB). Please connect Supabase in frontend/.env to enable direct large file uploads, or choose a file under 4.5 MB.');
      }

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
      const errMsg = err?.message || 'Failed to upload document.';
      if (err.status === 413 || errMsg.includes('413') || errMsg.includes('Content Too Large')) {
        setError('Upload failed: File exceeds Vercel serverless limit (4.5 MB). Please select a file under 4.5 MB or connect Supabase Storage for large files.');
      } else if (errMsg.includes('CORS') || errMsg.includes('Failed to fetch')) {
        setError('Network/CORS error communicating with backend. Please verify your backend server URL in frontend/.env.');
      } else {
        setError(errMsg);
      }
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

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  const value = {
    activeDocument,
    setActiveDocument,
    recentDocuments,
    activeTab,
    setActiveTab,
    user,
    setUser,
    handleSignOut,
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
