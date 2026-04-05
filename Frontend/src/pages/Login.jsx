import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Smile, Sparkles, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../translations';
import { registerUser, loginUser } from '../services/api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { darkMode, language, login, isAuthenticated } = useApp();

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await loginUser(formEmail, formPassword);
      } else {
        res = await registerUser(formName, formEmail, formPassword);
      }

      const { access_token, user } = res.data;
      login(access_token, user);
      // Redirect happens automatically via <Navigate> on re-render
    } catch (err) {
      const msg = err.response?.data?.detail || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-5 py-3.5 rounded-2xl border focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-400 transition-all shadow-inner font-medium ${
    darkMode 
      ? 'bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500' 
      : 'bg-white/50 border-white/40 text-slate-800 placeholder:text-slate-400'
  }`;

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden selection:bg-primary-500 selection:text-white px-4 ${
      darkMode ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      {/* Dynamic Background Blobs */}
      <div className={`absolute top-[-10%] left-[-10%] w-64 sm:w-96 h-64 sm:h-96 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse ${
        darkMode ? 'bg-primary-500/15 opacity-50' : 'bg-primary-400/30 opacity-70'
      }`}></div>
      <div className={`absolute top-[20%] right-[-10%] w-64 sm:w-96 h-64 sm:h-96 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse ${
        darkMode ? 'bg-purple-500/15 opacity-50' : 'bg-purple-400/30 opacity-70'
      }`} style={{ animationDelay: '2s' }}></div>
      <div className={`absolute bottom-[-10%] left-[20%] w-64 sm:w-96 h-64 sm:h-96 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse ${
        darkMode ? 'bg-accent-teal/10 opacity-40' : 'bg-accent-teal/30 opacity-70'
      }`} style={{ animationDelay: '4s' }}></div>

      <div className={`relative w-full max-w-md p-6 sm:p-8 md:p-10 backdrop-blur-2xl border shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem] sm:rounded-[2.5rem] animate-fade-in ${
        darkMode 
          ? 'bg-slate-800/60 border-slate-700/50' 
          : 'bg-white/60 border-white/50'
      }`}>
        
        <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2">
          <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-primary-500/30 border-4 border-white">
            <Sparkles size={28} className="fill-current sm:w-9 sm:h-9" />
          </div>
        </div>

        <div className="mt-4 sm:mt-6 text-center mb-6 sm:mb-8">
          <h2 className={`text-2xl sm:text-3xl font-extrabold mb-2 ${
            darkMode 
              ? 'text-slate-100' 
              : 'text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600'
          }`}>
            {isLogin ? t('welcomeBack', language) : t('createAccount', language)}
          </h2>
          <p className={`font-medium text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {isLogin ? t('loginSubtitle', language) : t('signupSubtitle', language)}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-slide-up ${
            darkMode ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isLogin ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
            <label className={`block text-sm font-bold mb-1.5 ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('name', language)}</label>
            <input 
              type="text" 
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className={inputClass}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className={`block text-sm font-bold mb-1.5 ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('email', language)}</label>
            <input 
              type="email" 
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-bold mb-1.5 ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('password', language)}</label>
            <input 
              type="password" 
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full relative group overflow-hidden py-3.5 sm:py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-primary-500/40 hover:-translate-y-1 mt-4 sm:mt-6 flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <span className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-2xl"></span>
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isLogin ? <LogIn size={20} /> : <UserPlus size={20} />
              )}
              {loading ? 'Please wait...' : (isLogin ? t('signIn', language) : t('createAccount', language))}
            </span>
          </button>
        </form>

        <div className={`mt-6 sm:mt-8 text-center text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {isLogin ? t('dontHaveAccount', language) : t('alreadyHaveAccount', language)}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-primary-600 font-bold hover:text-purple-600 transition-colors hover:underline decoration-2 underline-offset-4"
          >
            {isLogin ? t('signUp', language) : t('logIn', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
