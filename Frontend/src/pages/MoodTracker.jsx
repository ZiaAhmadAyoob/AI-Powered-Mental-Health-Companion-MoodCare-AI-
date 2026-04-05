import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../translations';
import { logMood as logMoodApi } from '../services/api';

export default function MoodTracker() {
  const { darkMode, language, setCurrentMood, setStressLevel, currentMood } = useApp();
  const [selectedMood, setSelectedMood] = useState(currentMood);
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const moods = [
    { emoji: '😢', state: 'sad', stress: 70 },
    { emoji: '😟', state: 'anxious', stress: 80 },
    { emoji: '😐', state: 'calm', stress: 30 },
    { emoji: '😊', state: 'happy', stress: 10 },
    { emoji: '😰', state: 'stressed', stress: 90 },
  ];

  const handleLogMood = async () => {
    const selected = moods.find(m => m.state === selectedMood);
    if (!selected || saving) return;

    setSaving(true);
    try {
      const res = await logMoodApi(selected.state, selected.stress, note);
      setCurrentMood(selected.state);
      setStressLevel(selected.stress);

      // show AI suggestion from backend before redirecting
      setShowSuccess(true);
      setTimeout(() => {
  navigate('/dashboard');
}, 2500);  // slightly longer so user can read AI suggestion
    } catch {
      alert('Failed to log mood. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`space-y-6 animate-fade-in h-full ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      <h1 className="text-2xl sm:text-4xl font-bold text-center mt-6 sm:mt-12 mb-1 sm:mb-2 tracking-tight">{t('howAreYouFeeling', language)}</h1>
      <p className={`text-center text-sm sm:text-lg mb-6 sm:mb-12 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('moodTrackerSubtitle', language)}</p>
      
      <div className={`max-w-2xl mx-auto backdrop-blur-xl p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border mt-4 sm:mt-10 transition-colors relative overflow-hidden ${
        darkMode 
          ? 'bg-slate-800/70 border-slate-700/50' 
          : 'bg-white/70 border-white/50'
      }`}>
        
        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center transition-all duration-500 ${
          showSuccess ? 'opacity-100 bg-emerald-500/90 backdrop-blur-md' : 'opacity-0 pointer-events-none'
        }`}>
          <CheckCircle size={56} className="text-white mb-4 animate-bounce sm:w-16 sm:h-16" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Mood Logged!</h2>
        </div>

        <div className="flex justify-between items-center px-0 sm:px-10 mb-8 sm:mb-12">
          {moods.map((mood) => (
            <button 
              key={mood.state}
              onClick={() => setSelectedMood(mood.state)}
              className={`transition-all duration-300 drop-shadow-md ${
                selectedMood === mood.state 
                  ? 'text-4xl sm:text-7xl scale-110 sm:scale-125 z-10' 
                  : 'text-3xl sm:text-6xl filter grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:scale-110'
              }`}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <label className={`block text-sm font-bold ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('addNote', language)}</label>
          <textarea 
            rows="3" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all resize-none leading-relaxed text-sm sm:text-base ${
              darkMode 
                ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500' 
                : 'bg-slate-50 border border-slate-200 text-slate-700'
            }`}
            placeholder={t('moodNotePlaceholder', language)}
          ></textarea>
        </div>

        <button 
          onClick={handleLogMood}
          disabled={saving}
          className={`w-full py-3.5 sm:py-4 mt-6 sm:mt-8 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-base sm:text-lg hover-glow group relative overflow-hidden ${
            saving ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <span className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-2xl"></span>
          <span className="relative z-10">{saving ? 'Saving...' : t('logMood', language)}</span>
        </button>
      </div>
    </div>
  );
}
