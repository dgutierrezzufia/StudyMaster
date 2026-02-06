
import React, { useState } from 'react';
import { Subject } from '../types';

interface DashboardProps {
  subjects: Subject[];
  onAddSubject: (name: string, icon: string) => void;
  onSelectSubject: (id: string) => void;
  onSelectRetos: () => void;
  isReadOnly?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ subjects, onAddSubject, onSelectSubject, onSelectRetos, isReadOnly }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('book');

  const icons = ['book', 'flask', 'calculator', 'globe', 'language', 'microscope', 'music', 'palette', 'dna', 'atom', 'laptop-code', 'landmark'];

  const now = new Date();
  const reviewedToday = subjects.reduce((acc, s) => acc + s.topics.reduce((tAcc, t) => {
    const todayQuiz = t.quizHistory?.some(q => new Date(q.date).toDateString() === now.toDateString());
    return tAcc + (todayQuiz ? 1 : 0);
  }, 0), 0);

  const dailyGoal = 3;
  const progressPercent = Math.min((reviewedToday / dailyGoal) * 100, 100);

  const pendingRetos = subjects.reduce((acc, s) => acc + s.topics.filter(t => t.nextReviewDate && new Date(t.nextReviewDate) <= now).length, 0);

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Meta Diaria de Repaso</p>
              <p className="text-3xl font-black text-slate-800">{reviewedToday} <span className="text-slate-300">/ {dailyGoal}</span></p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${reviewedToday >= dailyGoal ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
              <i className={reviewedToday >= dailyGoal ? "fas fa-trophy" : "fas fa-fire"}></i>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ease-out ${reviewedToday >= dailyGoal ? 'bg-emerald-500' : 'bg-indigo-600'}`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <button 
          onClick={onSelectRetos}
          className="bg-slate-900 p-8 rounded-3xl shadow-xl flex items-center gap-6 group hover:bg-black transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
             {pendingRetos > 0 && <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse shadow-lg">{pendingRetos} PENDIENTES</span>}
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="text-left">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Plan de Estudio</p>
            <p className="text-xl font-black text-white">Retos Diarios <i className="fas fa-arrow-right ml-2 text-xs text-indigo-400"></i></p>
          </div>
        </button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mis Asignaturas</h2>
        {!isReadOnly && (
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 px-6 py-3 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-100">
            <i className="fas fa-plus"></i> Nueva Asignatura
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-200 hover:border-indigo-500 hover:shadow-2xl transition-all text-left group flex flex-col gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <i className={`fas fa-${subject.icon} text-xl`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{subject.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subject.topics.length} temas</p>
              </div>
            </div>
          </button>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
            <p className="text-slate-400 font-bold">No hay asignaturas creadas.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-black mb-8">Nueva Asignatura</h2>
            <form onSubmit={(e) => { e.preventDefault(); onAddSubject(newSubjectName, selectedIcon); setIsModalOpen(false); }}>
              <input 
                type="text" required autoFocus value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)}
                className="w-full border-2 border-slate-100 rounded-2xl px-6 py-4 mb-6 focus:border-indigo-500 focus:bg-white transition-all bg-slate-50 text-slate-900 font-bold"
                placeholder="Nombre de la asignatura"
              />
              <div className="grid grid-cols-4 gap-2 mb-8">
                {icons.map(icon => (
                  <button key={icon} type="button" onClick={() => setSelectedIcon(icon)} className={`h-12 rounded-xl border-2 transition-all ${selectedIcon === icon ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 text-slate-300 hover:bg-slate-50'}`}>
                    <i className={`fas fa-${icon}`}></i>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
