import React from 'react';

const WelcomeScreen = ({ onLogin, onContinue }) => (
  <div className="welcome-screen flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
      <h1 className="text-2xl font-bold mb-6">Bienvenido a VitalLogix</h1>
      <p className="mb-8">Por favor, elige cómo deseas continuar:</p>
      <button
        className="w-full bg-blue-600 text-white py-2 px-4 rounded mb-4 hover:bg-blue-700 transition"
        onClick={onLogin}
      >
        Iniciar sesión
      </button>
      <button
        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition"
        onClick={onContinue}
      >
        Continuar como invitado
      </button>
    </div>
  </div>
);

export default WelcomeScreen;
