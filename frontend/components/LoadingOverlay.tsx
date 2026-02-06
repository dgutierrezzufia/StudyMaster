
import React from 'react';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "Sincronizando con la nube..." }) => {
  return (
    <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-fade-in">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fas fa-cloud text-indigo-200 text-xl animate-pulse"></i>
        </div>
      </div>
      <p className="mt-8 text-slate-800 font-black text-sm uppercase tracking-[0.3em] animate-pulse">
        {message}
      </p>
      <div className="mt-2 flex gap-1">
        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
