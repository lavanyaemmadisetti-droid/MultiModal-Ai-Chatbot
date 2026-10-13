import React, { useState } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import Navbar from './components/layout/Navbar';
import FileUploadZone from './components/upload/FileUploadZone';
import ChatInterface from './components/chat/ChatInterface';
import SummaryView from './components/summary/SummaryView';
import QuizGenerator from './components/quiz/QuizGenerator';
import FlashcardDeck from './components/quiz/FlashcardDeck';
import ConfigModal from './components/common/ConfigModal';
import { MessageSquare, BookOpen, Award, Layers, Sparkles, Shield, ExternalLink } from 'lucide-react';

const MainContent = () => {
  const { activeTab, setActiveTab } = useStudy();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const TABS = [
    { id: 'chat', label: 'Multimodal Q&A', icon: MessageSquare, badge: 'Interactive' },
    { id: 'summary', label: 'Smart Summarizer', icon: BookOpen, badge: '4 Styles' },
    { id: 'quiz', label: 'Quiz Generator', icon: Award, badge: 'MCQs & Scores' },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, badge: 'Active Recall' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <Navbar onOpenKeyInfo={() => setIsConfigOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/70 border border-slate-200 shadow-sm">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Next-Gen Academic Assistant Powered by Google Gemini</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Study Smarter with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                Multimodal AI
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
              Upload textbook PDFs, lecture slides, equations, and handwritten notes.
              Ask in-depth questions, extract point-wise revision summaries, and generate customized quizzes with arrows and step-by-step logic.
            </p>
          </div>
        </div>

        {/* Upload & Context Selector */}
        <section aria-label="Upload Study Materials">
          <FileUploadZone />
        </section>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1" aria-label="Tabs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center space-x-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-indigo-700 border border-slate-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`hidden md:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Tab Panel */}
        <section className="transition-all duration-200">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'summary' && <SummaryView />}
          {activeTab === 'quiz' && <QuizGenerator />}
          {activeTab === 'flashcards' && <FlashcardDeck />}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Multimodal AI StudyMate</span>
            <span>•</span>
            <span>React + Vite + Node.js + Express + Google Gemini</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="hover:text-indigo-600 transition flex items-center space-x-1 font-medium"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Zero-Leak API Security</span>
            </button>
            <span>•</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 transition flex items-center space-x-1 font-medium"
            >
              <span>Get Gemini Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Configuration Modal */}
      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <MainContent />
    </StudyProvider>
  );
}
