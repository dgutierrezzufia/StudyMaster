
import React, { useEffect, useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User, password?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const initGoogle = () => {
      // @ts-ignore
      if (window.google) {
        try {
          // @ts-ignore
          google.accounts.id.initialize({
            client_id: "90778196448-h128qninp8hu615qablol63r5igrd2b0.apps.googleusercontent.com", 
            callback: (response: any) => {
              const payload = decodeJwt(response.credential);
              if (payload) {
                try {
                  onLogin({
                    id: payload.sub,
                    name: payload.name,
                    email: payload.email,
                    picture: payload.picture,
                    isAdmin: false
                  });
                } catch (e: any) {
                  setError(e.message);
                }
              }
            },
            auto_select: false,
          });

          // @ts-ignore
          google.accounts.id.renderButton(
            document.getElementById("googleBtn"),
            { theme: "outline", size: "large", text: "signin_with", shape: "pill" }
          );
        } catch (e) {
          console.error("Google Init Error:", e);
        }
      } else {
        setTimeout(initGoogle, 500);
      }
    };

    initGoogle();
  }, [onLogin]);

  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      onLogin({
        id: crypto.randomUUID(),
        name: email.split('@')[0],
        email: email,
        picture: `https://ui-avatars.com/api/?name=${email}&background=4f46e5&color=fff`,
        isAdmin: false
      }, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl text-white flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
            <i className="fas fa-graduation-cap text-4xl"></i>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">StudyMaster <span className="text-indigo-400">AI</span></h1>
          <p className="text-slate-400 font-medium">Plataforma de estudio avanzada con IA</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-white/10">
          <h2 className="text-2xl font-black text-slate-800 mb-8 text-center">Acceso al Sistema</h2>
          
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-shake">
              <i className="fas fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          {!showEmailForm ? (
            <>
              <div id="googleBtn" className="flex justify-center w-full mb-4"></div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-300 font-black">O</span></div>
              </div>

              <button 
                onClick={() => setShowEmailForm(true)}
                className="w-full py-4 border-2 border-slate-100 rounded-full text-slate-600 font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
              >
                <i className="fas fa-envelope text-indigo-500 group-hover:scale-125 transition-transform"></i>
                Acceso por email
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailSubmit} className="animate-scale-in">
              <div className="mb-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Corporativo</label>
                <input 
                  type="email" 
                  required
                  placeholder="ejemplo@gecoas.com"
                  className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-8 relative">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-[44px] text-slate-300 hover:text-indigo-500 transition-colors"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Volver
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  Entrar <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>
            </form>
          )}

          <div className="pt-8 mt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Admin: dgutierrez@gecoas.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;