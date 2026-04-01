import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
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
  const [showWelcome, setShowWelcome] = useState(!auth.logged);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogin = async (username, password) => {
    try {
      const res = await apiLogin(username, password);
      const { token, roles } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', roles.includes('ADMIN') ? 'admin' : 'user');
      setAuth({ logged: true, role: roles.includes('ADMIN') ? 'admin' : 'user', username });
      setShowAuthModal(false);
      setShowWelcome(false);
    } catch (e) {
      if (!e.response) {
        alert('No se pudo conectar al backend. Verifica Docker y que el backend esté en puerto 8080.');
      } else if (e.response.status === 401) {
        alert('Usuario o contraseña incorrectos.');
      } else {
        alert('Error al iniciar sesión.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setAuth({ logged: false, role: null, username: null });
    setShowWelcome(true);
  };


  const handleRegister = async (username, password) => {
    try {
      await apiRegister(username, password);
      await handleLogin(username, password);
    } catch (e) {
      if (!e.response) {
        alert('No se pudo conectar al backend. Verifica Docker y que el backend esté en puerto 8080.');
      } else if (e.response.status === 409) {
        alert('El usuario ya existe.');
      } else {
        alert('Error al registrar usuario.');
      }
    }
  };

  const handleContinue = () => {
    setAuth({ logged: false, role: 'user', username: null });
    setShowWelcome(false);
  };

  return (
    <>
      {showWelcome && (
        <WelcomeScreen onLogin={() => setShowAuthModal(true)} onContinue={handleContinue} />
      )}
      {showAuthModal && (
        <AuthModal onLogin={handleLogin} onRegister={handleRegister} onClose={() => setShowAuthModal(false)} />
      )}
      {!showWelcome && (
        <App auth={auth} onRequireAuth={() => setShowAuthModal(true)} onLogout={handleLogout} />
      )}
    </>
  );
}

export default RootApp;
