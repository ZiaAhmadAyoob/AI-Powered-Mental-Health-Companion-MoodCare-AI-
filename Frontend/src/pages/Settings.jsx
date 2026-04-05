import React from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../translations';
import { updateProfile as updateProfileApi } from '../services/api';

export default function Settings() {
  const { darkMode, toggleDarkMode, language, setLanguage, userProfile, updateProfile } = useApp();

  const handleAnonymousToggle = async () => {
    const newValue = !userProfile.anonymousMode;
    updateProfile('anonymousMode', newValue);
    try {
      await updateProfileApi({ anonymous_mode: newValue });
    } catch {
      // Revert on failure
      updateProfile('anonymousMode', !newValue);
    }
  };

  return (
    <div className={`space-y-6 animate-fade-in ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      <h1 className="text-3xl font-bold">{t('settingsTitle', language)}</h1>
      <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{t('settingsSubtitle', language)}</p>
      
      <div className={`p-6 rounded-2xl shadow-sm border max-w-2xl transition-colors ${
        darkMode 
          ? 'bg-slate-800/70 border-slate-700' 
          : 'bg-white border-slate-100'
      }`}>
        <h3 className="font-semibold mb-6 text-xl">{t('appPreferences', language)}</h3>
        <div className="space-y-2">
          {/* Dark Mode Toggle */}
          <div className={`flex items-center justify-between py-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
            <div>
              <p className="font-medium">{t('darkMode', language)}</p>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('darkModeDesc', language)}</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                darkMode ? 'bg-primary-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={darkMode}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  darkMode ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notifications */}
          <div className={`flex items-center justify-between py-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
            <div>
              <p className="font-medium">{t('notifications', language)}</p>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('notificationsDesc', language)}</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-600" />
          </div>

          {/* Anonymous Mode — wired to context state */}
          <div className={`flex items-center justify-between py-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
            <div>
              <p className="font-medium">{t('anonymousMode', language)}</p>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('anonymousModeDesc', language)}</p>
            </div>
            <button
              onClick={handleAnonymousToggle}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent-teal/50 shrink-0 ${
                userProfile.anonymousMode ? 'bg-accent-teal' : (darkMode ? 'bg-slate-600' : 'bg-slate-300')
              }`}
              role="switch"
              aria-checked={userProfile.anonymousMode}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  userProfile.anonymousMode ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{t('languageLabel', language)}</p>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('languageDesc', language)}</p>
            </div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`border rounded-lg px-4 py-2 font-medium outline-none focus:ring-2 focus:ring-primary-100 transition-colors ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-primary-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-primary-400'
              }`}
            >
              <option value="en">English</option>
              <option value="ur">اردو</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
  );
}
