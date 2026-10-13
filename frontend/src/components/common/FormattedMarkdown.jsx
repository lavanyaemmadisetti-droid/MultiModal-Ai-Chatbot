import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Preprocess markdown to remove any accidental markdown hashes (#, ##, ###)
 * and replace them with clean arrow-based point headers.
 */
const cleanMarkdownContent = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    // Replace any leading markdown hashes (#, ##, ###, ####) with arrow point
    .replace(/^#{1,6}\s*(.+)$/gm, (match, title) => {
      let cleanTitle = title.trim();
      if (cleanTitle.startsWith('**') && cleanTitle.endsWith('**')) {
        cleanTitle = cleanTitle.slice(2, -2).trim();
      }
      return `\n➤ **${cleanTitle}**\n`;
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const FormattedMarkdown = ({ content, className = '' }) => {
  const sanitizedContent = cleanMarkdownContent(content);

  return (
    <div className={`space-y-3 leading-relaxed text-slate-700 text-sm ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Render any h1, h2, h3, h4 as clean arrow badges
          h1: ({ children }) => (
            <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base mt-4 mb-2 pb-1 border-b border-slate-200">
              <span className="text-indigo-600 font-bold">➤</span>
              <span>{children}</span>
            </div>
          ),
          h2: ({ children }) => (
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mt-3 mb-1.5">
              <span className="text-purple-600 font-bold">➤</span>
              <span>{children}</span>
            </div>
          ),
          h3: ({ children }) => (
            <div className="flex items-center space-x-2 text-slate-850 font-bold text-sm mt-3 mb-1.5">
              <span className="text-indigo-600 font-bold">➤</span>
              <span>{children}</span>
            </div>
          ),
          h4: ({ children }) => (
            <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs mt-2 mb-1">
              <span className="text-purple-600 font-bold">➔</span>
              <span>{children}</span>
            </div>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-700">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 my-2.5 pl-0.5 list-none">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 my-2.5 list-decimal pl-5 marker:text-indigo-600 marker:font-bold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-700 leading-relaxed flex items-start space-x-2 text-sm">
              <span className="text-indigo-600 font-bold mt-0.5 flex-shrink-0 select-none">➔</span>
              <div className="flex-1">{children}</div>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-indigo-950 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-slate-600 italic">{children}</em>
          ),
          code: ({ children, inline, ...props }) => {
            return (
              <code
                className="bg-slate-100 border border-slate-200 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono font-medium"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 overflow-x-auto my-3 shadow-xs">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-indigo-500 bg-indigo-50/50 p-2.5 rounded-r-lg text-slate-700 italic my-2">
              {children}
            </blockquote>
          )
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedMarkdown;
