
import React, { useState } from 'react';

interface SummaryViewProps {
  summary: string;
  onRegenerate: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summary, onRegenerate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Clean string for plain text copying (removing common markdown markers)
    const cleanText = summary.replace(/[#*`_]/g, '').trim();
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content: string) => {
    // Normalize content: remove some potential weirdness but keep essential markdown
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-4"></div>;

      // Handle Titles
      if (line.startsWith('#')) {
        const level = (line.match(/^#+/)?.[0].length || 1);
        const text = line.replace(/^#+\s*/, '').trim();
        return (
          <h4 key={i} className={`font-black text-indigo-700 ${level === 1 ? 'text-2xl mt-8' : 'text-xl mt-6'} mb-3`}>
            {text}
          </h4>
        );
      }

      // Handle Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().substring(2).trim();
        return (
          <div key={i} className="flex gap-4 mb-4 items-start pl-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0 shadow-sm"></div>
            <p className="text-slate-700 leading-relaxed font-medium flex-1" 
               dangerouslySetInnerHTML={{ __html: formatLine(text) }} />
          </div>
        );
      }

      // Default paragraph
      return (
        <p key={i} className="mb-5 text-slate-700 leading-relaxed font-medium text-lg" 
           dangerouslySetInnerHTML={{ __html: formatLine(line) }} />
      );
    });
  };

  // Safe line formatter for bold text and cleaning accidental HTML code snippets
  const formatLine = (text: string) => {
    return text
      // 1. Sanitize: Convert existing HTML entities if the model returned raw string representation
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      // 2. Clear known "junk" tags the model might output accidentally based on context
      .replace(/<b class="text-slate-900">(.*?)<\/b>/g, '$1')
      .replace(/<span.*?>(.*?)<\/span>/g, '$1')
      // 3. Proper Markdown Bold formatting
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-extrabold">$1</strong>')
      // 4. Handle simple bold tags if they were returned as literal text
      .replace(/<b>(.*?)<\/b>/g, '<strong class="text-slate-900 font-extrabold">$1</strong>');
  };

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
            <i className="fas fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 m-0">Resumen Estratégico</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Optimizado con IA</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRegenerate}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <i className="fas fa-rotate"></i> Regenerar
          </button>
          <button 
            onClick={handleCopy}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 border shadow-sm ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}`}
          >
            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i> 
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>
      
      <div className="bg-white/80 p-8 rounded-[2.5rem] border border-slate-100 flex-1 shadow-inner overflow-y-auto max-h-[65vh] custom-scrollbar">
        <div className="summary-content max-w-none">
          {renderContent(summary)}
        </div>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <i className="fas fa-lightbulb absolute -right-2 -bottom-2 text-6xl text-white/10 -rotate-12"></i>
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/30">
            <i className="fas fa-book-open-reader"></i>
          </div>
          <div>
            <p className="text-sm font-black mb-1">CONSEJO DE ESTUDIO</p>
            <p className="text-sm text-white/90 font-medium leading-relaxed">
              Este resumen cubre todos los puntos críticos. Lee con calma y presta atención a los términos resaltados antes de realizar el quiz de repaso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
