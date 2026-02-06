
import React from 'react';
import { Subject, QuizAttempt } from '../types';

interface ResultsPanelProps {
  subjects: Subject[];
  onBack: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ subjects, onBack }) => {
  const allAttempts: { subjectName: string; topicName: string; attempt: QuizAttempt }[] = [];
  subjects.forEach(s => {
    s.topics.forEach(t => {
      t.quizHistory.forEach(a => {
        allAttempts.push({ subjectName: s.name, topicName: t.name, attempt: a });
      });
    });
  });

  const sortedAttempts = allAttempts.sort((a, b) => new Date(b.attempt.date).getTime() - new Date(a.attempt.date).getTime());
  const totalQuizzes = sortedAttempts.length;
  const avgScore = totalQuizzes === 0 ? 0 : Math.round((sortedAttempts.reduce((acc, curr) => acc + (curr.attempt.score / curr.attempt.total), 0) / totalQuizzes) * 100);

  const getAccuracyColor = (perc: number) => {
    if (perc >= 80) return 'text-emerald-500';
    if (perc >= 60) return 'text-indigo-500';
    if (perc >= 40) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 transition-all"><i className="fas fa-arrow-left"></i></button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mi Rendimiento</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Precisión Media</h3>
          <p className={`text-6xl font-black ${getAccuracyColor(avgScore)}`}>{avgScore}%</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Asignaturas</h3>
          <p className="text-6xl font-black text-slate-900">{subjects.length}</p>
        </div>
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-center">
          <h3 className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">Quizzes Realizados</h3>
          <p className="text-6xl font-black">{totalQuizzes}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-10">
        <h2 className="text-2xl font-black text-slate-900 mb-8">Historial de Retos</h2>
        {totalQuizzes === 0 ? <p className="text-slate-400 font-bold text-center py-20">No hay datos suficientes.</p> : (
          <div className="space-y-6">
            {sortedAttempts.map(({ subjectName, topicName, attempt }) => {
              const perc = Math.round((attempt.score/attempt.total)*100);
              return (
                <div key={attempt.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 transition-all">
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{subjectName}</span>
                    <h4 className="font-black text-slate-800 mt-1">{topicName}</h4>
                  </div>
                  <div className={`text-xl font-black ${getAccuracyColor(perc)}`}>{perc}%</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
