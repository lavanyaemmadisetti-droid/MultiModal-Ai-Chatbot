import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { isSupabaseFrontendConfigured } from '../../services/supabase';

export const FileUploadZone = () => {
  const { activeDocument, handleUpload, loadSampleDoc, recentDocuments, isUploading, error, setError } = useStudy();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25 MB limit.');
      return;
    }

    if (file.size > 4.5 * 1024 * 1024 && !isSupabaseFrontendConfigured()) {
      setError(`File size is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Vercel serverless functions have a 4.5 MB request limit. Please configure Supabase in frontend/.env to enable direct large file uploads up to 25 MB, or select a file under 4.5 MB.`);
      return;
    }

    try {
      await handleUpload(file);
    } catch {
      // Error handled in context
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Dropzone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-6 sm:p-8 text-center bg-white shadow-xs ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/40 shadow-md shadow-indigo-500/10'
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={onFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 transition group-hover:scale-105">
            {isUploading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              {isUploading ? 'Processing & analyzing document...' : 'Click or drag & drop lecture PDF or study image'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF, PNG, JPG, WEBP (Diagrams, handwritten notes, textbook pages up to 25MB)
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> PDF Slides & Books
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-purple-600" /> Diagrams & Notes
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Document Card */}
      {activeDocument && (
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              {activeDocument.mimetype?.includes('image') ? (
                <ImageIcon className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                  {activeDocument.filename}
                </p>
                {activeDocument.isSample && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                    Sample Doc
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                <span>{formatFileSize(activeDocument.size)}</span>
                {activeDocument.pageCount && <span>• {activeDocument.pageCount} page(s)</span>}
                {activeDocument.wordCount > 0 && <span>• ~{activeDocument.wordCount} words</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition"
            >
              Replace File
            </button>
          </div>
        </div>
      )}

      {/* Recent / Sample Document Quick Switcher */}
      {recentDocuments && recentDocuments.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-medium flex-shrink-0">Recent:</span>
          {recentDocuments.map((doc) => (
            <button
              key={doc.id}
              onClick={() => loadSampleDoc(doc)}
              className={`px-3 py-1.5 rounded-lg border text-xs truncate max-w-[180px] font-medium transition ${
                activeDocument?.id === doc.id
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {doc.filename}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
