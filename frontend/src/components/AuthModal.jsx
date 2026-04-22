import React, { useState } from 'react';
import vitalLogixLogo from '../assets/vitallogix-logo.svg';

const AuthModal = ({ onLogin, onRegister, onContinueAsGuest, onClose, canClose = false }) => {
  const [isRegister, setIsRegister] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e, mode) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        await onRegister(username, password);
      } else {
        await onLogin(username, password);
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const switchLabel = isRegister ? 'Iniciar sesion' : 'Crear cuenta';
  const switchHelper = isRegister ? 'Ya tienes cuenta?' : 'No tienes cuenta?';
  const renderForm = (mode) => {
    const registerMode = mode === 'register';
    const heading = registerMode ? 'CREAR CUENTA' : 'INICIAR SESION';
    const buttonText = loading && isRegister === registerMode
      ? 'Procesando...'
      : registerMode ? 'CREAR CUENTA' : 'INICIAR SESION';

    return (
      <form onSubmit={(e) => handleSubmit(e, mode)} className="space-y-4 sm:space-y-5">


        <h3 className="text-3xl sm:text-4xl font-black tracking-wider text-white">{heading}</h3>

        <input
          type="text"
          placeholder="Usuario"
          className="w-full rounded-2xl border-2 border-[#7ab3d6] bg-[#0f507d] px-4 sm:px-5 py-3.5 sm:py-4 text-base sm:text-xl text-white outline-none focus:border-[#a8d4ee]"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contrasena"
            className="w-full rounded-2xl border-2 border-[#7ab3d6] bg-[#0f507d] px-4 sm:px-5 py-3.5 sm:py-4 pr-12 sm:pr-14 text-base sm:text-xl text-white outline-none focus:border-[#a8d4ee]"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 sm:pr-5 text-blue-200 hover:text-white transition-colors"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>

        {error && isRegister === registerMode && (
          <div className="flex items-center gap-3 rounded-xl border border-[#f5c2c7] bg-[#f8d7da] px-4 py-3.5 text-sm font-medium text-[#842029] shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0 text-[#dc3545]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {!registerMode && (
          <label className="flex items-center gap-3 text-sm sm:text-lg font-semibold text-blue-50/90 select-none">
            <input type="checkbox" className="h-4 w-4 rounded border border-white/50 bg-transparent" />
            Mantener sesion iniciada
          </label>
        )}

        <button
          type="submit"
          className="w-full mt-2 sm:mt-3 rounded-2xl bg-[#d4ecfa] text-[#0f4266] py-3.5 sm:py-4 text-lg sm:text-xl font-black tracking-wide hover:bg-white transition-colors disabled:opacity-60"
          disabled={loading && isRegister === registerMode}
        >
          {buttonText}
        </button>

        <>
          <div className="text-center text-lg sm:text-xl font-bold text-blue-100">O</div>
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="w-full rounded-2xl border border-white/50 bg-transparent px-5 sm:px-6 py-3.5 sm:py-4 text-lg sm:text-xl font-extrabold text-white hover:bg-white/10 transition-colors"
          >
            Entrar como invitado
          </button>
        </>
      </form>
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#eff4fb] via-[#e6eef9] to-[#dce8f6] p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="mx-auto my-3 sm:my-6 max-w-6xl min-h-[92vh] lg:min-h-[88vh] rounded-2xl sm:rounded-3xl border border-[#c2d7ea]/75 bg-[#eef4fb] lg:bg-transparent backdrop-blur-sm shadow-[0_28px_70px_-28px_rgba(26,70,112,0.55)] overflow-hidden ring-1 ring-white/35">
        <div className="lg:hidden min-h-[92vh] p-5 sm:p-8">
          <div className="rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-[#234d78] to-[#4b86b6]">
            <div className="text-center mb-7">
              <div className="relative mx-auto w-full max-w-[240px]">
                <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-cyan-300/40 via-sky-300/35 to-emerald-300/45 blur-2xl auth-logo-glow" />
                <img src={vitalLogixLogo} alt="VitalLogix" className="relative w-full mx-auto auth-logo-float auth-logo-vibrant" />
              </div>
              <p className="mt-5 text-lg font-semibold tracking-wide text-blue-50">BIENVENIDO A</p>
              <h2 className="text-4xl font-black tracking-tight text-white">VitalLogix</h2>
            </div>

            {renderForm(isRegister ? 'register' : 'login')}

            <div className="mt-6 text-center">
              <p className="text-base text-blue-50/95">{switchHelper}</p>
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="mt-3 rounded-xl border-2 border-white/80 px-7 py-2.5 text-base font-bold text-white hover:bg-white hover:text-[#1d5e8a] transition-colors"
              >
                {switchLabel}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative min-h-[88vh] overflow-hidden bg-gradient-to-r from-[#3f79a9] to-[#5d94bf]">
          <div
            className={`pointer-events-none absolute inset-y-0 z-0 w-1/2 bg-[#234d78] shadow-[0_0_80px_rgba(19,46,76,0.45)] transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${isRegister ? 'left-0' : 'left-1/2'}`}
          />

          <div className="absolute inset-0">
            <section className={`absolute inset-y-0 left-0 z-10 w-[calc(50%+1px)] px-12 xl:px-16 py-12 flex items-center transition-all duration-700 ease-in-out ${isRegister ? '-translate-x-8 opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
              <div className="w-full">{renderForm('login')}</div>
            </section>

            <section className={`absolute inset-y-0 right-0 z-10 w-[calc(50%+1px)] px-12 xl:px-16 py-12 flex items-center transition-all duration-700 ease-in-out ${isRegister ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 pointer-events-none'}`}>
              <div className="w-full">{renderForm('register')}</div>
            </section>
          </div>

          <aside
            className={`absolute inset-y-0 z-20 w-[calc(50%+1px)] text-white flex items-center justify-center p-10 xl:p-12 transition-all duration-700 ease-in-out ${isRegister ? 'left-0' : 'left-[calc(50%-1px)]'}`}
          >
            <div className="text-center max-w-md">
              <div className="relative mx-auto w-full max-w-sm">
                <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-cyan-300/40 via-sky-300/35 to-emerald-300/45 blur-2xl auth-logo-glow" />
                <img src={vitalLogixLogo} alt="VitalLogix" className="relative w-full mx-auto auth-logo-float auth-logo-vibrant" />
              </div>
              <p className="mt-8 text-2xl font-semibold tracking-wide text-blue-50">BIENVENIDO A</p>
              <h2 className="text-5xl font-black mt-2 tracking-tight">VitalLogix</h2>
              <p className="mt-10 text-2xl text-blue-50/95">{switchHelper}</p>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsRegister(!isRegister);
                }}
                className="mt-5 rounded-xl border-2 border-white/80 px-10 py-3 text-xl font-bold hover:bg-white hover:text-[#1d5e8a] transition-colors"
              >
                {switchLabel}
              </button>
            </div>
          </aside>

          {canClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-30 h-11 w-11 rounded-full border border-white/40 bg-black/20 text-white text-2xl leading-none hover:bg-black/35"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
