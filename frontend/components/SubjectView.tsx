import React, { useState } from 'react';
import { Subject } from '../types';
import * as mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs';

interface SubjectViewProps {
  subject: Subject;
  onBack: () => void;
  onAddTopic: (name: string, content: string) => void;
  onSelectTopic: (id: string) => void;
  onDeleteSubject: () => void;
  isReadOnly?: boolean;
}

const SubjectView: React.FC<SubjectViewProps> = ({ subject, onBack, onAddTopic, onSelectTopic, onDeleteSubject, isReadOnly }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const [topicName, setTopicName] = useState('');
  const [topicContent, setTopicContent] = useState('');
  const [activeInputMode, setActiveInputMode] = useState<'manual' | 'upload'>('manual');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topicName.trim() && topicContent.trim()) {
      onAddTopic(topicName, topicContent);
      setTopicName('');
      setTopicContent('');
      setIsModalOpen(false);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        setTopicContent(fullText.trim());
      } 
      else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setTopicContent(result.value.trim());
      } 
      else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setTopicContent(text);
        };
        reader.readAsText(file);
      }

      if (!topicName) {
        setTopicName(file.name.replace(/\.[^/.]+$/, ""));
      }
      setActiveInputMode('manual');
    } catch (error) {
      console.error("Error processing file:", error);
      alert("No se pudo procesar el archivo.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200">
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className={`w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg`}>
          <i className={`fas fa-${subject.icon} text-xl`}></i>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{subject.name}</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{subject.topics.length} temas cargados</p>
        </div>
        {!isReadOnly && (
          <button 
            onClick={() => { setIsDeleteModalOpen(true); setConfirmDelete(false); }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-600 transition-all"
          >
            <i className="fas fa-trash-can"></i>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-700 flex items-center gap-2">
              <i className="fas fa-list-ul text-indigo-500"></i>
              Temas de Estudio
            </h2>
            {!isReadOnly && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-50 flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Añadir Tema
              </button>
            )}
          </div>

          {subject.topics.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                <i className="fas fa-file-circle-plus text-2xl"></i>
              </div>
              <p className="text-slate-400 font-bold">Sin temas cargados aún.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {subject.topics.map((topic) => {
                const isDue = topic.nextReviewDate && new Date(topic.nextReviewDate) <= new Date();
                const lastAttempt = topic.quizHistory?.[0];
                const score = lastAttempt ? (lastAttempt.score / lastAttempt.total) * 100 : 0;
                
                return (
                  <button
                    key={topic.id}
                    onClick={() => onSelectTopic(topic.id)}
                    className={`w-full bg-white border-2 p-5 rounded-[2rem] flex items-center gap-4 transition-all text-left group hover:shadow-xl ${isDue ? 'border-rose-100' : 'border-slate-100 hover:border-indigo-100'}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isDue ? 'bg-rose-50 text-rose-500 animate-pulse' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                      <i className={`fas ${isDue ? 'fa-clock-rotate-left' : 'fa-book-open'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors text-lg truncate">{topic.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {score >= 90 && <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase">Dominado</span>}
                        {score > 0 && score < 90 && <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">En progreso</span>}
                        {!lastAttempt && <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">Pendiente</span>}
                        {isDue && <span className="text-[9px] font-black bg-rose-600 text-white px-2 py-0.5 rounded uppercase">Repaso necesario</span>}
                      </div>
                    </div>
                    <i className="fas fa-chevron-right text-[10px] text-slate-300 group-hover:translate-x-1 transition-transform"></i>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <i className="fas fa-chart-pie text-indigo-600"></i>
              Resumen Dominio
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  <span>Temas Dominados</span>
                  <span>{Math.round((subject.topics.filter(t => (t.quizHistory?.[0]?.score / t.quizHistory?.[0]?.total) >= 0.9).length / (subject.topics.length || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-1000"
                    style={{ width: `${(subject.topics.filter(t => (t.quizHistory?.[0]?.score / t.quizHistory?.[0]?.total) >= 0.9).length / (subject.topics.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Repasos Hoy</p>
                  <p className="text-2xl font-black text-slate-800">
                    {subject.topics.filter(t => t.nextReviewDate && new Date(t.nextReviewDate) <= new Date()).length}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Apuntes</p>
                  <p className="text-2xl font-black text-slate-800">
                    {subject.topics.reduce((acc, t) => acc + (t.notes?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">Añadir Nuevo Tema</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-100 transition-colors">
                <i className="fas fa-xmark text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Título del Tema</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  className="w-full border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all bg-slate-50 text-slate-900 font-bold"
                  placeholder="Ej: Derivadas e Integrales"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                />
              </div>

              <div className="mb-8">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Contenido / Material</label>
                
                <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
                  <button 
                    type="button"
                    onClick={() => setActiveInputMode('manual')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${activeInputMode === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Escritura Manual
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveInputMode('upload')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${activeInputMode === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Subir Archivo
                  </button>
                </div>

                {activeInputMode === 'manual' ? (
                  <textarea 
                    required
                    rows={8}
                    className="w-full border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all bg-slate-50 text-slate-900 font-medium resize-none"
                    placeholder="Pega aquí el texto de tu lección..."
                    value={topicContent}
                    onChange={(e) => setTopicContent(e.target.value)}
                  ></textarea>
                ) : (
                  <div 
                    className={`border-2 border-dashed rounded-[2rem] p-12 transition-all flex flex-col items-center justify-center text-center cursor-pointer relative ${isDragging ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file) processFile(file);
                    }}
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                  >
                    {isProcessingFile ? (
                      <div className="animate-pulse">
                        <i className="fas fa-spinner fa-spin text-3xl mb-4 text-indigo-600"></i>
                        <p className="font-black text-slate-800">Procesando...</p>
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-file-arrow-up text-4xl mb-4"></i>
                        <p className="font-black text-slate-800 mb-1">Arrastra tu archivo aquí</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">PDF, DOCX o TXT</p>
                      </>
                    )}
                    <input id="file-upload-input" type="file" className="hidden" accept=".txt,.md,.pdf,.docx" onChange={handleFileUpload} />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!topicName || !topicContent || isProcessingFile}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-lg disabled:opacity-50"
                >
                  Añadir Tema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-scale-in text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500">
              <i className="fas fa-triangle-exclamation text-4xl"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">¿Eliminar asignatura?</h2>
            <p className="text-slate-400 mb-8 font-medium">Se perderán todos los temas, resúmenes y estadísticas de <b>{subject.name}</b>.</p>
            
            <button 
              onClick={() => { onDeleteSubject(); setIsDeleteModalOpen(false); }}
              className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 shadow-lg mb-3"
            >
              Sí, eliminar definitivamente
            </button>
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="w-full py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl"
            >
              No, mantener
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectView;