import React, { useState } from 'react';
import FormattedMarkdown from '../common/FormattedMarkdown';
import { BookOpen, Sparkles, Zap, ListChecks, FileSpreadsheet, Copy, Check, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { generateSummary } from '../../services/api';

const SUMMARY_STYLES = [
  {
    id: 'detailed',
    label: 'Detailed Study Guide',
    desc: 'In-depth point breakdown with explanations, definitions & formulas',
    icon: BookOpen
  },
  {
    id: 'quick',
    label: 'Quick TL;DR',
    desc: 'Rapid point-wise overview using arrows for high-speed review',
    icon: Zap
  },
  {
    id: 'bullet_points',
    label: 'Key Takeaways & Bullets',
    desc: 'Clean arrow-bulleted breakdown of key facts and core concepts',
    icon: ListChecks
  },
  {
    id: 'cheat_sheet',
    label: 'Exam Cheat Sheet',
    desc: 'Formulas with arrows (➤ Formula ➔ Variables) & cram points',
    icon: FileSpreadsheet
  }
];

export const SummaryView = () => {
  const { activeDocument } = useStudy();
  const [selectedStyle, setSelectedStyle] = useState('detailed');
  const [focusTopic, setFocusTopic] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (styleOverride = null) => {
    if (!activeDocument) {
      setError('Please upload or select a document first.');
      return;
    }

    const style = styleOverride || selectedStyle;
    setIsLoading(true);
    setError(null);

    try {
      const res = await generateSummary({
        documentId: activeDocument.id,
        style,
        focusTopic: focusTopic.trim()
      });

      if (res?.data) {
        setSummaryData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate summary. Please check your backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryData?.summary) return;
    navigator.clipboard.writeText(summaryData.summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summaryData?.summary) return;
    const blob = new Blob([summaryData.summary], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDocument?.filename || 'Document'}_Summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Options Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Document Summarizer</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose your preferred study format and let Gemini synthesize clean, point-wise notes using arrows.
          </p>
        </div>

        {/* Style Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SUMMARY_STYLES.map((style) => {
            const Icon = style.icon;
            const isSelected = selectedStyle === style.id;

            return (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center space-x-2.5 mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {style.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{style.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Optional Focus Topic & Generate Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            value={focusTopic}
            onChange={(e) => setFocusTopic(e.target.value)}
            placeholder="Optional topic focus (e.g., 'Chapter 4', 'Loss Functions', 'Derivations')..."
            className="flex-1 bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          />

          <button
            onClick={() => handleGenerate()}
            disabled={isLoading || !activeDocument}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-sm shadow-indigo-600/20"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {SUMMARY_STYLES.find((s) => s.id === selectedStyle)?.label}</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Summary Output Area */}
      {summaryData && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-fade-in">
          {/* Action Bar */}
          <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-800">
                Summary for: {activeDocument?.filename}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                {SUMMARY_STYLES.find((s) => s.id === summaryData.style)?.label || 'Summary'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition flex items-center space-x-1.5 shadow-2xs"
                title="Copy markdown to clipboard"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition flex items-center space-x-1.5 shadow-2xs"
                title="Download markdown notes"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export .md</span>
              </button>
            </div>
          </div>

          {/* Key Takeaways Highlight Cards */}
          {summaryData.keyTakeaways && summaryData.keyTakeaways.length > 0 && (
            <div className="p-6 border-b border-slate-200 bg-indigo-50/40">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>High-Yield Key Takeaways</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {summaryData.keyTakeaways.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-indigo-200/80 text-xs text-slate-800 leading-relaxed flex items-start space-x-2 shadow-2xs"
                  >
                    <span className="font-bold text-indigo-600 mt-0.5 select-none">➔</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Markdown Summary Body */}
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[500px] bg-white">
            <FormattedMarkdown content={summaryData.summary} />
          </div>
        </div>
      )}

      {/* Initial Placeholder State */}
      {!summaryData && !isLoading && (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 bg-white shadow-2xs">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">Ready to synthesize your study materials</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Select one of the 4 summary formats above and click "Generate" to create comprehensive revision notes without hash clutter.
          </p>
        </div>
      )}
    </div>
  );
};

export default SummaryView;
