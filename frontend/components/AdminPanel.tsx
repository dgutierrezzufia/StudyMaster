
import React, { useState } from 'react';
import { AuthorizedUser } from '../types';

interface AdminPanelProps {
  authorizedUsers: AuthorizedUser[];
  onUpdateUsers: (users: AuthorizedUser[]) => void;
  onBack: () => void;
  onSupervise: (user: AuthorizedUser) => void;
  currentUserId: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ authorizedUsers, onUpdateUsers, onBack, onSupervise, currentUserId }) => {
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [showPassForm, setShowPassForm] = useState<{email: string} | null>(null);
  const [tempPass, setTempPass] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail && !authorizedUsers.some(u => u.email.toLowerCase() === newEmail.toLowerCase())) {
      onUpdateUsers([...authorizedUsers, { 
        id: crypto.randomUUID(),
        email: newEmail.toLowerCase(), 
        name: newName || newEmail.split('@')[0],
        password: newPassword || 'User1234',
        isAdmin: makeAdmin 
      }]);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      setMakeAdmin(false);
    }
  };

  const handleToggleAdmin = (email: string) => {
    if (email === 'dgutierrez@gecoas.com') return;
    onUpdateUsers(authorizedUsers.map(u => 
      u.email === email ? { ...u, isAdmin: !u.isAdmin } : u
    ));
  };

  const handleResetPassword = (email: string) => {
    if (!tempPass) return;
    onUpdateUsers(authorizedUsers.map(u => 
      u.email === email ? { ...u, password: tempPass } : u
    ));
    setShowPassForm(null);
    setTempPass('');
    alert(`Contraseña de ${email} actualizada.`);
  };

  const handleRemoveUser = (email: string) => {
    if (email === 'dgutierrez@gecoas.com') return;
    onUpdateUsers(authorizedUsers.filter(u => u.email !== email));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 transition-all">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión de Accesos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl h-fit">
          <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <i className="fas fa-user-plus text-indigo-600"></i>
            Autorizar Nuevo Usuario
          </h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
              <input 
                type="text" 
                required
                placeholder="Juan Pérez"
                className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
              <input 
                type="email" 
                required
                placeholder="ejemplo@gecoas.com"
                className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contraseña Inicial</label>
              <input 
                type="text" 
                placeholder="Por defecto: User1234"
                className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-5 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input 
                type="checkbox" 
                id="adminCheck"
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                checked={makeAdmin}
                onChange={(e) => setMakeAdmin(e.target.checked)}
              />
              <label htmlFor="adminCheck" className="text-sm font-bold text-slate-700 cursor-pointer">
                Conceder privilegios de Administrador
              </label>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
              <i className="fas fa-plus"></i> Autorizar Usuario
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col">
          <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <i className="fas fa-users-gear text-indigo-600"></i>
            Usuarios y Roles
          </h2>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
            {authorizedUsers.map(user => (
              <div key={user.email} className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                      <i className="fas fa-user text-sm"></i>
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-black text-slate-700 truncate">{user.name || user.email}</p>
                      <p className="text-[10px] text-slate-400 font-bold truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${user.email === 'dgutierrez@gecoas.com' ? 'bg-indigo-600 text-white' : user.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-500'}`}>
                      {user.email === 'dgutierrez@gecoas.com' ? 'Super Admin' : user.isAdmin ? 'Admin' : 'Estudiante'}
                    </span>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       {user.id !== currentUserId && (
                         <button 
                          onClick={() => onSupervise(user)}
                          className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100 flex items-center justify-center shadow-sm"
                          title="Supervisar usuario"
                        >
                          <i className="fas fa-eye text-[10px]"></i>
                        </button>
                       )}
                       <button 
                        onClick={() => setShowPassForm(showPassForm?.email === user.email ? null : { email: user.email })}
                        className="w-8 h-8 rounded-lg bg-white text-slate-400 hover:text-amber-500 border border-slate-100 flex items-center justify-center shadow-sm"
                        title="Cambiar contraseña"
                      >
                        <i className="fas fa-key text-[10px]"></i>
                      </button>
                      {user.email !== 'dgutierrez@gecoas.com' && (
                        <>
                          <button 
                            onClick={() => handleToggleAdmin(user.email)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${user.isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-white text-slate-300'} border border-slate-100`}
                          >
                            <i className="fas fa-user-shield text-[10px]"></i>
                          </button>
                          <button 
                            onClick={() => handleRemoveUser(user.email)}
                            className="w-8 h-8 rounded-lg bg-white text-rose-300 hover:text-rose-600 border border-slate-100 flex items-center justify-center"
                          >
                            <i className="fas fa-trash text-[10px]"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {showPassForm?.email === user.email && (
                  <div className="mt-4 pt-4 border-t border-slate-200 animate-slide-down">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nueva contraseña"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
                        value={tempPass}
                        onChange={(e) => setTempPass(e.target.value)}
                      />
                      <button 
                        onClick={() => handleResetPassword(user.email)}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-[10px] font-black"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
