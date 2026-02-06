
import React from 'react';
import { Note } from '../types';

interface NotesPanelProps {
  notes: Note[];
  onRemoveNote: (id: string) => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ notes, onRemoveNote }) => {
  // Formateador simple para los apuntes
  const formatMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-900">$1</strong>')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('<br/>');
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
          <i className="fas fa-note-sticky"></i>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 m-0">Mis Apuntes de IA</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Información clave guardada del chat</p>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
            <i className="fas fa-pencil-square text-4xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No hay apuntes aún</h3>
          <p className="text-slate-500 max-w-sm">Mientras chateas con el tutor, puedes guardar sus explicaciones más útiles para repasarlas aquí más tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {notes.map((note) => (
            <div key={note.id} className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl relative group hover:bg-white hover:border-amber-200 transition-all flex flex-col">
              <button 
                onClick={() => onRemoveNote(note.id)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-slate-300 hover:text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
              >
                <i className="fas fa-trash-can text-xs"></i>
              </button>
              <div className="flex items-center gap-2 mb-3 text-amber-600/60">
                <i className="fas fa-quote-left text-xs"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Apunte guardado</span>
              </div>
              <p 
                className="text-slate-700 font-medium leading-relaxed flex-1 italic text-sm"
                dangerouslySetInnerHTML={{ __html: `"${formatMarkdown(note.text)}"` }}
              />
              <div className="mt-4 pt-4 border-t border-amber-100/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {new Date(note.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesPanel;
