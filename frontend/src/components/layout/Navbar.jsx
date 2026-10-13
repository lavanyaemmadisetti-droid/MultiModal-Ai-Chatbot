import React from 'react';
import { Sparkles, Cpu, KeyRound, Info, Database, User, LogOut } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const Navbar = ({ onOpenKeyInfo, onOpenAuth }) => {
  const { backendStatus, user, handleSignOut } = useStudy();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">StudyMate</span>
              <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md shadow-xs">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Online Learning & Study Assistant</p>
          </div>
        </div>

        {/* Status Indicators & Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Supabase Status Indicator */}
          <button
            onClick={onOpenKeyInfo}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              backendStatus.supabaseConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-100/90 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title={backendStatus.supabaseConfigured ? 'Supabase Database & Storage Connected' : 'Supabase Not Configured (Using Memory)'}
          >
            <Database className={`w-3.5 h-3.5 ${backendStatus.supabaseConfigured ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>{backendStatus.supabaseConfigured ? 'Supabase Live' : 'Supabase (Setup)'}</span>
          </button>

          {/* Gemini Model Indicator */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-700">
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span>Gemini 2.5 Flash</span>
          </div>

          {/* Backend / Key Status Indicator */}
          <button
            onClick={onOpenKeyInfo}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              backendStatus.geminiConfigured
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-xs'
                : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 shadow-xs'
            }`}
            title="Click for API Key configuration details"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus.geminiConfigured ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span>{backendStatus.geminiConfigured ? 'Gemini Active' : 'Demo Mode (Add Key)'}</span>
            <KeyRound className="w-3.5 h-3.5 ml-0.5 opacity-70" />
          </button>

          {/* User Auth Button */}
          {user ? (
            <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span className="max-w-[100px] sm:max-w-[140px] truncate">{user.email?.split('@')[0]}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs"
              title="Student Sign In / Sign Up"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Setup / Docs button */}
          <button
            onClick={onOpenKeyInfo}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
            aria-label="How to configure"
            title="Setup Guide & API Keys"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
