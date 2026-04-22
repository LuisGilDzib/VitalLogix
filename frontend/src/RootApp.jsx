import React, { useState } from 'react';
import AuthModal from './components/AuthModal';
import App from './App';
import { login as apiLogin, register as apiRegister } from './services/api';

function RootApp() {
  const [auth, setAuth] = useState(() => {
    // Simple persistence
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    return token ? { logged: true, role, username } : { logged: false, role: null, username: null };
  });
  const [showAuthModal, setShowAuthModal] = useState(!auth.logged);

  const handleLogin = async (username, password) => {
    try {
      const res = await apiLogin(username, password);
      const { token, roles } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', roles.includes('ADMIN') ? 'admin' : 'user');
      setAuth({ logged: true, role: roles.includes('ADMIN') ? 'admin' : 'user', username });
      setShowAuthModal(false);
    } catch (e) {
      if (!e.response) {
        throw new Error('No se pudo conectar al backend. Verifica Docker y que el backend esté en puerto 8080.');
      } else if (e.response.status === 401) {
        throw new Error('Correo electrónico o contraseña inválidos. Las contraseñas distinguen entre mayúsculas y minúsculas. Inténtalo nuevamente.');
      } else {
        throw new Error('Error al iniciar sesión.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setAuth({ logged: false, role: null, username: null });
    setShowAuthModal(true);
  };


  const handleRegister = async (username, password) => {
    try {
      await apiRegister(username, password);
      await handleLogin(username, password);
    } catch (e) {
      if (!e.response) {
        throw new Error('No se pudo conectar al backend. Verifica Docker y que el backend esté en puerto 8080.');
      } else if (e.response.status === 409) {
        throw new Error('El usuario ya existe.');
      } else {
        throw new Error('Error al registrar usuario.');
      }
    }
  };

  const handleContinueAsGuest = () => {
    localStorage.removeItem('token');
    localStorage.setItem('role', 'user');
    localStorage.setItem('username', 'Invitado');
    setAuth({ logged: false, role: 'user', username: 'Invitado' });
    setShowAuthModal(false);
  };

  return (
    <>
      {showAuthModal && (
        <AuthModal
          onLogin={handleLogin}
          onRegister={handleRegister}
          onContinueAsGuest={handleContinueAsGuest}
          onClose={() => setShowAuthModal(false)}
          canClose={auth.logged || auth.role === 'user'}
        />
      )}
      {!showAuthModal && (
        <App auth={auth} onRequireAuth={() => setShowAuthModal(true)} onLogout={handleLogout} />
      )}
    </>
  );
}

export default RootApp;
