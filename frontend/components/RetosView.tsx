
import React from 'react';
import { Subject } from '../types';

interface RetosViewProps {
  subjects: Subject[];
  onSelectTopic: (subjectId: string, topicId: string) => void;
  onBack: () => void;
}

const RetosView: React.FC<RetosViewProps> = ({ subjects, onSelectTopic, onBack }) => {
  const now = new Date();
  const studyPlan = subjects.flatMap(s => 
    s.topics.filter(t => t.nextReviewDate && new Date(t.nextReviewDate) <= now)
    .map(t => ({ ...t, subjectName: s.name, subjectId: s.id }))
  ).sort((a, b) => new Date(a.nextReviewDate!).getTime() - new Date(b.nextReviewDate!).getTime());

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 transition-all">
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Retos Diarios</h1>
          <p className="text-slate-500 font-medium">Temas que requieren tu atención hoy según el algoritmo de repetición.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-calendar-check text-indigo-400 text-2xl"></i>
            <h3 className="font-black text-lg uppercase tracking-tight">Tu Plan de Hoy</h3>
          </div>
          <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{studyPlan.length} Pendientes</span>
        </div>

        <div className="p-8">
          {studyPlan.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-check-double text-4xl"></i>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">¡Todo al día!</h2>
              <p className="text-slate-400 font-medium max-w-sm mx-auto">Has completado todos tus retos de estudio por ahora. ¡Buen trabajo!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyPlan.map(topic => (
                <button 
                  key={topic.id}
                  onClick={() => onSelectTopic(topic.subjectId, topic.id)}
                  className="w-full text-left p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-white hover:shadow-xl transition-all flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{topic.subjectName}</p>
                    <p className="text-lg font-black text-slate-800 truncate">{topic.name}</p>
                    <p className="text-[10px] text-rose-500 font-black flex items-center gap-1 mt-1">
                      <i className="fas fa-clock"></i> REPASO VENCIDO
                    </p>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 group-hover:translate-x-1 transition-transform"></i>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetosView;
