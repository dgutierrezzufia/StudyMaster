
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  history: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSaveNote: (text: string) => void;
  onClearHistory: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ history, onSendMessage, onSaveNote, onClearHistory }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim());
      setInput('');
      setIsTyping(true);
    }
  };

  useEffect(() => {
    if (history.length > 0 && history[history.length - 1].role === 'model') {
      setIsTyping(false);
    }
  }, [history]);

  // Formateador simple para el chat
  const formatMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .split('\n')
      .map(line => line.trim())
      .join('<br/>');
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 m-0">Tutor Personal IA</h3>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              En línea
            </p>
          </div>
        </div>
        {history.length > 0 && (
          <button 
            onClick={() => setIsClearModalOpen(true)}
            className="text-[10px] font-black text-slate-400 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-all flex items-center gap-2 uppercase tracking-widest"
          >
            <i className="fas fa-trash-can"></i> Limpiar historial
          </button>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 mb-6 space-y-4 custom-scrollbar"
      >
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-10">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <i className="fas fa-comment-dots text-2xl"></i>
            </div>
            <p className="text-slate-500 font-medium">Pregúntame cualquier duda que tengas sobre el material. Te responderé de forma sencilla y concisa.</p>
          </div>
        )}

        {history.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`p-4 rounded-2xl font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}
                dangerouslySetInnerHTML={{ 
                  __html: msg.role === 'model' ? formatMarkdown(msg.text) : msg.text 
                }}
              />
              {msg.role === 'model' && (
                <button 
                  onClick={() => onSaveNote(msg.text)}
                  className="mt-1 text-[10px] font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-1 px-1 transition-colors"
                >
                  <i className="fas fa-bookmark"></i> Guardar en Apuntes
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none border border-slate-200 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input 
          type="text" 
          disabled={isTyping}
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-800"
          placeholder="Escribe tu pregunta aquí..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button 
          type="submit"
          disabled={!input.trim() || isTyping}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md active:scale-90 disabled:opacity-50"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>

      {/* Modal de confirmación para limpiar historial */}
      {isClearModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-scale-in text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500">
              <i className="fas fa-eraser text-3xl"></i>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">¿Borrar conversación?</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              Se eliminará todo el historial de mensajes actual. Esta acción no afecta a tus apuntes guardados.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsClearModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={() => { onClearHistory(); setIsClearModalOpen(false); }}
                className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
              >
                Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
