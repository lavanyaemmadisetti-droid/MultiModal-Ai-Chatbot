import React, { useState } from 'react';
import { X, KeyRound, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, Database, FileCode } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const ConfigModal = ({ isOpen, onClose }) => {
  const { backendStatus } = useStudy();
  const [activeTab, setActiveTab] = useState('supabase');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Selector */}
        <div className="flex space-x-2 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
              activeTab === 'supabase'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Supabase Database</span>
          </button>
          <button
            onClick={() => setActiveTab('gemini')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
              activeTab === 'gemini'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-purple-600" />
            <span>Google Gemini AI</span>
          </button>
        </div>

        {/* SUPABASE TAB */}
        {activeTab === 'supabase' && (
          <div>
            {/* Header */}
            <div className="flex items-center space-x-3 mb-5">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Supabase Connection</h3>
                <p className="text-xs text-slate-500">Persistent PostgreSQL database & cloud file storage</p>
              </div>
            </div>

            {/* Current Status Pill */}
            <div className="mb-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                {backendStatus.supabaseConfigured ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
                <span className="text-sm font-semibold text-slate-800">
                  {backendStatus.supabaseConfigured
                    ? 'Supabase DB & Storage Connected'
                    : 'In-Memory Mode (Add Supabase Credentials)'}
                </span>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  backendStatus.supabaseConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {backendStatus.supabaseConfigured ? 'CONNECTED' : 'IN-MEMORY'}
              </span>
            </div>

            {/* Security Notice */}
            <div className="mb-5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/70 flex items-start space-x-2.5 text-xs text-indigo-950">
              <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Graceful Fallback:</strong> If Supabase is not connected, the app seamlessly runs using fast in-memory storage. When connected, files and history persist across restarts!
              </span>
            </div>

            {/* Setup Steps */}
            <div className="space-y-4 text-sm text-slate-700 mb-6">
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-900">Create a Free Supabase Project</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sign in to Supabase and click "New project".
                  </p>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 hover:text-emerald-900 mt-1 font-semibold"
                  >
                    <span>Open Supabase Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-900">Run the Database Schema</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Open <strong>SQL Editor</strong> in Supabase and run the script located at:
                  </p>
                  <div className="mt-1.5 p-2 bg-slate-100 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>backend/supabase-schema.sql</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    This automatically builds the tables (<code className="font-mono text-slate-700">documents</code>, <code className="font-mono text-slate-700">chat_history</code>, <code className="font-mono text-slate-700">summaries</code>, <code className="font-mono text-slate-700">quiz_results</code>) and storage bucket.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-900">Copy URL & Anon Key to backend/.env</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    In Supabase, go to <strong>Project Settings &gt; API</strong> and copy your Project URL & Anon public key:
                  </p>
                  <div className="mt-1.5 p-2.5 bg-slate-100 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
                    <div>SUPABASE_URL=https://your-project.supabase.co</div>
                    <div>SUPABASE_SERVICE_ROLE_KEY=eyJh... (role-based secret)</div>
                    <div>SUPABASE_ANON_KEY=eyJh... (or anon key)</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  4
                </span>
                <div>
                  <p className="font-bold text-slate-900">Restart Backend</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Restart your backend server to load the new credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GEMINI TAB */}
        {activeTab === 'gemini' && (
          <div>
            {/* Header */}
            <div className="flex items-center space-x-3 mb-5">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Google Gemini API Setup</h3>
                <p className="text-xs text-slate-500">Secure server-side API configuration</p>
              </div>
            </div>

            {/* Current Status Pill */}
            <div className="mb-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                {backendStatus.geminiConfigured ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
                <span className="text-sm font-semibold text-slate-800">
                  {backendStatus.geminiConfigured
                    ? 'Gemini API is Active & Connected'
                    : 'Demo / Fallback Mode (No API key detected)'}
                </span>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  backendStatus.geminiConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {backendStatus.geminiConfigured ? 'LIVE' : 'DEMO'}
              </span>
            </div>

            {/* Security Notice */}
            <div className="mb-5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/70 flex items-start space-x-2.5 text-xs text-indigo-950">
              <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Zero-Leak Security:</strong> Your API key is stored strictly on the Node.js backend in{' '}
                <code className="text-indigo-800 bg-indigo-100 px-1 py-0.5 rounded font-mono">backend/.env</code> and is never sent to the browser.
              </span>
            </div>

            {/* Setup Steps */}
            <div className="space-y-4 text-sm text-slate-700 mb-6">
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-900">Get a free Google Gemini API Key</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Google provides free API keys for Gemini models at Google AI Studio.
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-800 mt-1 font-semibold"
                  >
                    <span>Open Google AI Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-900">Add key to backend/.env</p>
                  <div className="mt-1.5 p-2.5 bg-slate-100 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 flex items-center justify-between">
                    <span>GEMINI_API_KEY=AQ.Ab8...</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-900">Restart the backend</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Run <code className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-indigo-700 font-mono">npm run dev:backend</code> or restart your terminal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs transition shadow-sm shadow-indigo-600/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
