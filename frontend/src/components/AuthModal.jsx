import React, { useState } from 'react';

const AuthModal = ({ onLogin, onRegister, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await onRegister(username, password);
      } else {
        await onLogin(username, password);
      }
    } catch (err) {
      setError('Error de autenticación o registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b bg-blue-50/50 flex justify-between items-center">
          <h3 className="text-lg font-black text-blue-900 uppercase">
            {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-red-600 text-sm font-bold pb-2">{error}</div>}
          <input
            type="text"
            placeholder="Usuario"
            className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="flex-1 py-3 font-bold text-blue-400 text-sm">
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
            <button type="submit" className="flex-1 bg-blue-700 text-white font-black py-3 rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-blue-200 disabled:opacity-60" disabled={loading}>
              {loading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
