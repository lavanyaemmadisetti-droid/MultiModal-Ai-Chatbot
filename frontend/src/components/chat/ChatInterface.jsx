import React, { useState, useRef, useEffect } from 'react';
import FormattedMarkdown from '../common/FormattedMarkdown';
import { Send, Bot, User, Sparkles, Copy, Check, Trash2 } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { askQuestion } from '../../services/api';

const DEFAULT_PROMPTS = [
  'Explain the main concepts in simple terms.',
  'What are the core formulas or equations here?',
  'What are 3 high-probability exam questions?',
  'Give a real-world example of this concept.'
];

export const ChatInterface = () => {
  const { activeDocument } = useStudy();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your **StudyMate AI tutor**.\n\n➤ **How I Can Help You**\n➔ Break down complex concepts into step-by-step points\n➔ Explain formulas, derivations, and equations\n➔ Analyze diagrams, charts, and handwritten notes\n➔ Prepare high-yield answers for exams\n\nAsk me any question about your uploaded document!`,
      suggestedQuestions: DEFAULT_PROMPTS
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const questionText = typeof textToSend === 'string' ? textToSend : input;
    if (!questionText.trim() || isLoading) return;

    if (!activeDocument) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: questionText
        },
        {
          role: 'assistant',
          content: '⚠️ Please upload a PDF or image first so I can analyze it for you!'
        }
      ]);
      setInput('');
      return;
    }

    const newMessages = [
      ...messages,
      { role: 'user', content: questionText.trim() }
    ];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = newMessages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await askQuestion({
        documentId: activeDocument.id,
        question: questionText.trim(),
        chatHistory
      });

      if (res?.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.answer,
            suggestedQuestions: res.data.suggestedQuestions || []
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Error: ${err.message || 'Unable to get response from Gemini AI. Please check your backend connection and API key.'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat cleared. Ready for your questions on **${activeDocument?.filename || 'your document'}**!`,
        suggestedQuestions: DEFAULT_PROMPTS
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[650px] rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">StudyMate Live Chat</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Active Material: {activeDocument ? activeDocument.filename : 'No document selected'}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition text-xs font-medium flex items-center space-x-1 shadow-2xs"
          title="Reset conversation"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAFBFD]">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={index}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-2xs ${
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                    : 'bg-white border border-slate-200 text-indigo-600'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-600/10'
                    : 'bg-white border border-slate-200/90 text-slate-800'
                }`}
              >
                {/* Copy button for AI replies */}
                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.content, index)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 transition"
                    title="Copy response"
                  >
                    {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* Content */}
                <FormattedMarkdown content={msg.content} />

                {/* Suggested follow-up chips if provided */}
                {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 mb-2 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>Suggested Follow-ups:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSendMessage(q)}
                          className="text-left text-xs px-3 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 hover:text-indigo-900 font-medium transition shadow-2xs"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-xs">
              <Bot className="w-4 h-4 animate-spin text-indigo-600" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center space-x-2 shadow-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Gemini is analyzing your material and structuring points...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              activeDocument
                ? `Ask about "${activeDocument.filename}"... (e.g. "Explain backpropagation step by step")`
                : 'Upload a document or select a sample above to ask questions...'
            }
            disabled={isLoading}
            className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl pl-4 pr-12 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition shadow-xs"
            title="Send Question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400 mt-2">
          Gemini 2.5 Flash delivers point-wise structured explanations directly from your lecture materials.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
