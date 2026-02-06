
import React, { useState, useEffect, useMemo } from 'react';
import { QuizQuestion, QuizAttempt } from '../types';

interface QuizViewProps {
  questions: QuizQuestion[];
  onFinish?: (score: number, total: number, userAnswers: (number | null)[]) => void;
  reviewAttempt?: QuizAttempt;
  onCloseReview?: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onFinish, reviewAttempt, onCloseReview }) => {
  const isReviewMode = !!reviewAttempt;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(isReviewMode);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
    isReviewMode ? reviewAttempt!.userAnswers : new Array(questions.length).fill(null)
  );

  const preparedQuestions = useMemo(() => questions, [questions]);
  const currentQuestion = preparedQuestions[currentIdx];

  const handleSelectAnswer = (idx: number) => {
    if (showResult || isReviewMode) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = idx;
    setUserAnswers(newAnswers);
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === currentQuestion.correctAnswerIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIdx < preparedQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(isReviewMode ? userAnswers[currentIdx + 1] : null);
      setShowResult(isReviewMode);
    } else {
      if (isReviewMode) onCloseReview?.();
      else setQuizFinished(true);
    }
  };

  if (quizFinished) {
    const percentage = Math.round((score / preparedQuestions.length) * 100);
    const getResultColor = () => {
      if (percentage >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      if (percentage >= 50) return 'text-amber-500 bg-amber-50 border-amber-100';
      return 'text-rose-500 bg-rose-50 border-rose-100';
    };

    return (
      <div className="text-center py-16 animate-scale-in h-full flex flex-col justify-center items-center">
        <div className={`p-10 rounded-[3rem] border-4 mb-8 flex flex-col items-center gap-4 ${getResultColor()}`}>
          <div className="text-6xl mb-2">
            <i className={percentage >= 80 ? "fas fa-trophy" : percentage >= 50 ? "fas fa-medal" : "fas fa-heart-pulse"}></i>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Puntuación Final</p>
            <h2 className="text-7xl font-black">{percentage}%</h2>
          </div>
        </div>
        
        <div className="mb-10">
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-1">Resultado Detallado</p>
          <p className="text-slate-600 font-bold text-lg">Has acertado {score} de {preparedQuestions.length} preguntas.</p>
        </div>

        <button 
          onClick={() => onFinish?.(score, preparedQuestions.length, userAnswers)} 
          className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          Finalizar y Guardar <i className="fas fa-check-circle"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="flex items-center justify-between mb-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full">{currentIdx + 1} / {preparedQuestions.length}</span>
            {currentQuestion.isReused && <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1"><i className="fas fa-rotate"></i> REUTILIZADA</span>}
          </div>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">{currentQuestion.question}</h3>
        </div>
      </div>

      <div className="space-y-3 mb-10 overflow-y-auto custom-scrollbar pr-2">
        {currentQuestion.options.map((option, idx) => {
          let style = "bg-white border-slate-100 text-slate-700 hover:border-indigo-200";
          if (showResult || isReviewMode) {
            const isCorrect = idx === currentQuestion.correctAnswerIndex;
            const isSelected = idx === userAnswers[currentIdx];
            if (isCorrect) style = "bg-emerald-50 border-emerald-500 text-emerald-800 font-black";
            else if (isSelected) style = "bg-rose-50 border-rose-500 text-rose-800 font-black";
            else style = "opacity-40 border-slate-50";
          }
          return (
            <button key={idx} disabled={showResult && !isReviewMode} onClick={() => handleSelectAnswer(idx)} className={`w-full text-left p-6 border-2 rounded-2xl transition-all flex items-center gap-4 ${style}`}>
              <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-xs shrink-0">{String.fromCharCode(65 + idx)}</span>
              <span className="text-lg font-medium">{option}</span>
            </button>
          );
        })}
      </div>

      {(showResult || isReviewMode) && (
        <div className="bg-slate-50 p-8 rounded-[2.5rem] mt-auto animate-slide-up border border-slate-100">
          <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
            <i className="fas fa-circle-info"></i> Explicación
          </p>
          <p className="text-slate-600 font-medium leading-relaxed mb-6">{currentQuestion.explanation}</p>
          <button onClick={handleNext} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-black transition-all">
            {currentIdx < preparedQuestions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'} <i className="fas fa-arrow-right ml-2 text-xs"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizView;
