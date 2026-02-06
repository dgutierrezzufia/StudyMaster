
import React, { useState } from 'react';
import { Subject, Topic, QuizAttempt, QuizQuestion, ChatMessage, Note } from '../types';
import { generateSummary, generateQuiz, askQuestion } from '../services/geminiService';
import QuizView from './QuizView';
import SummaryView from './SummaryView';
import ChatPanel from './ChatPanel';
import NotesPanel from './NotesPanel';

interface TopicViewProps {
  subject: Subject;
  topic: Topic;
  onBack: () => void;
  onUpdateTopic: (updates: Partial<Topic>) => void;
  onSaveAttempt: (attempt: QuizAttempt) => void;
  onDeleteTopic: () => void;
  isReadOnly?: boolean;
}

const TopicView: React.FC<TopicViewProps> = ({ subject, topic, onBack, onUpdateTopic, onSaveAttempt, onDeleteTopic, isReadOnly }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'summary' | 'quiz' | 'chat' | 'notes'>('content');
  const [loading, setLoading] = useState(false);
  
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [reviewAttempt, setReviewAttempt] = useState<QuizAttempt | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showQuizSelector, setShowQuizSelector] = useState(false);

  // Algoritmo de barajado real Fisher-Yates
  const shuffle = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  // Barajado profundo de preguntas y sus opciones
  const deepShuffleQuiz = (questions: QuizQuestion[]): QuizQuestion[] => {
    return shuffle(questions).map(q => {
      const originalOptions = [...q.options];
      const correctText = originalOptions[q.correctAnswerIndex];
      const shuffledOptions = shuffle(originalOptions);
      return {
        ...q,
        options: shuffledOptions,
        correctAnswerIndex: shuffledOptions.indexOf(correctText),
        isReused: true
      };
    });
  };

  const handleGenerateSummary = async () => {
    if (isReadOnly) return;
    setLoading(true);
    try {
      const summary = await generateSummary(topic.content);
      onUpdateTopic({ summary });
      setActiveTab('summary');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async (length: 5 | 10) => {
    if (isReadOnly) return;
    setLoading(true);
    setShowQuizSelector(false);
    try {
      const questions = await generateQuiz(topic.content, length);
      setActiveQuizQuestions(deepShuffleQuiz(questions));
      setActiveTab('quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatQuiz = (attempt: QuizAttempt) => {
    if (isReadOnly) return;
    setIsRetrying(true);
    setActiveQuizQuestions(deepShuffleQuiz(attempt.questions));
    setActiveTab('quiz');
  };

  const handleViewReview = (attempt: QuizAttempt) => {
    // Marcado manual al revisar
    if (!attempt.isReviewed) {
      const updatedHistory = topic.quizHistory.map(a => 
        a.id === attempt.id ? { ...a, isReviewed: true } : a
      );
      onUpdateTopic({ quizHistory: updatedHistory });
    }
    setReviewAttempt(attempt);
  };

  const handleFinishQuiz = (score: number, total: number, userAnswers: (number | null)[]) => {
    const attempt: QuizAttempt = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      score, total,
      questions: activeQuizQuestions!,
      userAnswers,
      isRetry: isRetrying,
      isReviewed: false 
    };
    onSaveAttempt(attempt);
    setActiveQuizQuestions(null);
  };

  const notesCount = topic.notes?.length || 0;

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 transition-all">
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-800">{topic.name}</h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{subject.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-3">
          {['content', 'summary', 'quiz', 'chat', 'notes'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)} 
              className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all border-2 relative ${activeTab === tab ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-600 border-white hover:border-indigo-200'}`}
            >
              <i className={`fas fa-${tab === 'content' ? 'file-lines' : tab === 'summary' ? 'wand-magic' : tab === 'quiz' ? 'clipboard-question' : tab === 'chat' ? 'comments' : 'note-sticky'}`}></i>
              <span className="font-bold capitalize">{tab === 'quiz' ? 'Repaso' : tab === 'chat' ? 'Tutor IA' : tab === 'summary' ? 'Resumen' : tab === 'notes' ? 'Apuntes' : tab}</span>
              {tab === 'notes' && notesCount > 0 && (
                <span className="absolute right-4 w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center text-[10px] font-black">{notesCount}</span>
              )}
            </button>
          ))}
        </aside>

        <div className="lg:col-span-3 min-h-[500px]">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm h-full flex flex-col relative">
            {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-[2.5rem]"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div></div>}
            
            {activeTab === 'content' && <div className="summary-content">{topic.content}</div>}
            {activeTab === 'summary' && topic.summary && <SummaryView summary={topic.summary} onRegenerate={handleGenerateSummary} />}
            {activeTab === 'quiz' && (
              <div className="flex-1 flex flex-col">
                {activeQuizQuestions ? (
                  <QuizView questions={activeQuizQuestions} onFinish={handleFinishQuiz} />
                ) : reviewAttempt ? (
                  <QuizView questions={reviewAttempt.questions} reviewAttempt={reviewAttempt} onCloseReview={() => setReviewAttempt(null)} />
                ) : showQuizSelector ? (
                  <div className="flex-1 flex items-center justify-center gap-6">
                    <button onClick={() => handleGenerateQuiz(5)} className="w-32 h-32 bg-slate-50 border-4 border-slate-100 rounded-3xl font-black hover:border-indigo-600 transition-all">5 Preg</button>
                    <button onClick={() => handleGenerateQuiz(10)} className="w-32 h-32 bg-slate-50 border-4 border-slate-100 rounded-3xl font-black hover:border-indigo-600 transition-all">10 Preg</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button onClick={() => setShowQuizSelector(true)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">Nuevo Reto</button>
                    {topic.quizHistory.map(a => (
                      <div key={a.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center group">
                        <div>
                          <p className="text-xs font-black text-slate-400">{new Date(a.date).toLocaleDateString()}</p>
                          <p className="font-bold">Resultado: {a.score}/{a.total}</p>
                          {a.isReviewed && <span className="text-[9px] font-black text-emerald-500 uppercase"><i className="fas fa-check"></i> Repasado</span>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleRepeatQuiz(a)} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-amber-500"><i className="fas fa-rotate"></i></button>
                          <button onClick={() => handleViewReview(a)} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600"><i className="fas fa-eye"></i></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'chat' && <ChatPanel history={topic.chatHistory} onSendMessage={async (q) => {
              const res = await askQuestion(topic.content, topic.chatHistory, q);
              onUpdateTopic({ chatHistory: [...topic.chatHistory, {role:'user', text:q}, {role:'model', text:res}] });
            }} onSaveNote={(t) => onUpdateTopic({ notes: [...topic.notes, {id:crypto.randomUUID(), text:t, date:new Date().toISOString()}] })} onClearHistory={() => onUpdateTopic({chatHistory:[]})} />}
            {activeTab === 'notes' && <NotesPanel notes={topic.notes} onRemoveNote={(id) => onUpdateTopic({notes: topic.notes.filter(n=>n.id!==id)})} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicView;
