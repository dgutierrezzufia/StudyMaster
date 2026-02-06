
import React, { useState } from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onHome: () => void;
  onResults: () => void;
  onAdmin: () => void;
  onLogout: () => void;
  onChangePassword: (newPass: string) => void;
  isSupervising?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onHome, onResults, onAdmin, onLogout, onChangePassword, isSupervising }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPass, setNewPass] = useState('');

  const handlePassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres.");
      return;
    }
    onChangePassword(newPass);
    setShowPassModal(false);
    setNewPass('');
  };

  return (
    <header className={`bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm ${isSupervising ? 'border-b-4 border-b-amber-400' : ''}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button 
          onClick={onHome}
          className="flex items-center gap-3 group"
        >
          <div className="bg-indigo-600 w-10 h-10 rounded-xl text-white flex items-center justify-center group-hover:bg-indigo-700 transition-all shadow-md group-hover:rotate-6">
            <i className="fas fa-graduation-cap text-lg"></i>
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-800">StudyMaster <span className="text-indigo-600">AI</span></span>
        </button>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 text-sm font-bold text-slate-600 mr-4">
            <button onClick={onHome} className="hover:text-indigo-600 transition-colors flex items-center gap-2">
              <i className="fas fa-book"></i> Mis Asignaturas
            </button>
            <button onClick={onResults} className="hover:text-indigo-600 transition-colors flex items-center gap-2">
              <i className="fas fa-chart-line"></i> Resultados
            </button>
            {user.isAdmin && (
              <button onClick={onAdmin} className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-2">
                <i className="fas fa-user-shield"></i> Admin
              </button>
            )}
          </nav>

          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-2 p-1 pr-3 rounded-full border transition-all ${isSupervising ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}
            >
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full shadow-sm" />
              <span className="hidden sm:block text-xs font-black text-slate-700">{user.name.split(' ')[0]}</span>
              <i className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}></i>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-scale-in origin-top-right">
                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Usuario</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                </div>
                <button 
                  onClick={() => { onResults(); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 font-bold transition-colors flex items-center gap-3"
                >
                  <i className="fas fa-chart-pie text-indigo-400"></i> Mis Estadísticas
                </button>
                <button 
                  onClick={() => { setShowPassModal(true); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-600 font-bold transition-colors flex items-center gap-3"
                >
                  <i className="fas fa-key text-amber-400"></i> Cambiar Contraseña
                </button>
                {user.isAdmin && (
                  <button 
                    onClick={() => { onAdmin(); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 font-bold transition-colors flex items-center gap-3"
                  >
                    <i className="fas fa-sliders text-indigo-400"></i> Panel Control
                  </button>
                )}
                <div className="h-px bg-slate-50 my-1"></div>
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-bold transition-colors flex items-center gap-3"
                >
                  <i className="fas fa-right-from-bracket"></i> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <i className="fas fa-shield-keyhole text-indigo-600"></i>
              Nueva Contraseña
            </h2>
            <form onSubmit={handlePassSubmit}>
              <input 
                type="password" 
                autoFocus
                required
                placeholder="Mínimo 4 caracteres"
                className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 mb-6"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-50 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 shadow-lg active:scale-95"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
