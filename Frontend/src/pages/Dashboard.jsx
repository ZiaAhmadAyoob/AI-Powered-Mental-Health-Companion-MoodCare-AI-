import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../services/api';
import { ArrowRight, MessageSquare, PlusCircle, Flame, Award, Zap, Brain, Sparkles, Heart, RefreshCw, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BreathingExercise from '../components/BreathingExercise';
import { useApp } from '../context/AppContext';
import { t } from '../translations';


// Get time-based greeting key
function getGreetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return 'goodMorning';
  if (hour < 17) return 'goodAfternoon';
  return 'goodEvening';
}

// Mood to emoji map
const moodEmoji = {
  happy: '😊', calm: '😌', sad: '😢', stressed: '😰', anxious: '😟',
  positive: '😊', neutral: '😐',
};

// Mood to mood label key
const moodLabelKey = {
  happy: 'happy', calm: 'calm', sad: 'sad', stressed: 'stressed', anxious: 'anxious',
  positive: 'happy', neutral: 'calm',
};

export default function Dashboard() {
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // All dynamic dashboard data from the backend
  const [dashData, setDashData] = useState(null);

  const {
    darkMode, language, userProfile,
    setCurrentMood, setStressLevel, setStreakDays,
    setAiInsights, setAiPrediction, setWeeklySummary,
    isAuthenticated
  } = useApp();

  // Dynamic greeting using user's first name
  const firstName = userProfile?.name?.split(' ')[0] || 'User';

  // ── Fetch all dashboard data in a single call ──────────────────────
  const fetchDashboard = () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);

    getDashboardData()
      .then(res => {
        const d = res.data;
        setDashData(d);

        // Sync to global context so other pages can use it
        setCurrentMood(d.current_mood || 'calm');
        setStressLevel(d.stress_level ?? 30);
        setStreakDays(d.streak_days || 0);
        setAiInsights(d.ai_insights || []);
        setWeeklySummary(d.weekly_summary || '');
        if (d.tip_of_the_day) {
          setAiPrediction({ insight: d.tip_of_the_day, predicted_mood: d.predicted_mood });
        }
      })
      .catch(err => {
        console.error('Dashboard fetch failed:', err);
        setError('Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── Derived values from dashData ───────────────────────────────────
  const currentMood = dashData?.current_mood || 'calm';
  const stressLevel = dashData?.stress_level ?? 30;
  const streakDays = dashData?.streak_days || 0;
  const journalCount = dashData?.journal_count || 0;
  const aiInsights = dashData?.ai_insights || [];
  const weeklySummary = dashData?.weekly_summary || '';
  const aiGreeting = dashData?.ai_greeting || '';
  const tipOfTheDay = dashData?.tip_of_the_day || '';

  const cardClass = darkMode
    ? 'bg-slate-800/70 backdrop-blur-xl border-slate-700/50'
    : 'bg-white/70 backdrop-blur-xl border-white/50';
  const cardShadow = 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]';

  // XAI labels based on stress
  const xaiBreathingKey = stressLevel > 40 ? 'xaiBreathing' : 'xaiBreathingLow';
  const xaiGratitudeKey = stressLevel > 40 ? 'xaiGratitude' : 'xaiGratitudeLow';

  // Stress label
  const stressLabel = stressLevel <= 30 ? 'low' : stressLevel <= 60 ? 'medium' : 'high';
  const stressColor = stressLevel <= 30 ? 'text-green-500' : stressLevel <= 60 ? 'text-yellow-500' : 'text-red-500';
  const stressBarColor = stressLevel <= 30 ? 'bg-green-400' : stressLevel <= 60 ? 'bg-yellow-400' : 'bg-red-400';

  // Build dynamic greeting string with user's name
  const greetingBase = t(getGreetingKey(), language);
  const personalGreeting = greetingBase.replace(/John|جان/gi, firstName);

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8 animate-fade-in min-h-full">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
          <div>
            <div className={`h-8 w-64 rounded-xl animate-pulse ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`h-5 w-96 mt-2 rounded-lg animate-pulse ${darkMode ? 'bg-slate-700/60' : 'bg-slate-200/60'}`} />
          </div>
          <div className="flex gap-2">
            <div className={`h-9 w-28 rounded-2xl animate-pulse ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`h-9 w-24 rounded-2xl animate-pulse ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>
        </div>
        {/* Summary skeleton */}
        <div className={`h-20 rounded-3xl animate-pulse ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100/50'}`} />
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-32 rounded-3xl animate-pulse ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100/50'}`} />
          ))}
        </div>
        {/* Companion skeleton */}
        <div className={`h-40 rounded-3xl animate-pulse ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100/50'}`} />
        <div className="flex items-center justify-center gap-2 pt-2">
          <Loader2 size={20} className={`animate-spin ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
          <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading your personalized dashboard...</span>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <div className={`text-6xl`}>😔</div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
          Something went wrong
        </h2>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{error}</p>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all hover:scale-105"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in relative min-h-full">
      <BreathingExercise isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)} />
      
      {/* ===== HEADER WITH AI GREETING ===== */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            {personalGreeting}
          </h1>
          <p className={`mt-1 sm:mt-2 text-base sm:text-lg ${darkMode ? 'text-primary-400' : 'text-primary-600'} font-medium animate-slide-up`}>
            {aiGreeting}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dynamic streak badge */}
          <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-sm border hover-glow text-sm ${
            darkMode ? 'bg-orange-900/30 text-orange-400 border-orange-800/50' : 'bg-orange-50 text-orange-600 border-orange-100'
          }`}>
            <Flame size={18} className="fill-current" />
            <span className="font-bold">
              {streakDays} {language === 'ur' ? 'دن' : streakDays === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          {/* Mindful badge — only show when user has journal entries */}
          {journalCount > 0 && (
            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-sm border hover-glow text-sm ${
              darkMode ? 'bg-purple-900/30 text-purple-400 border-purple-800/50' : 'bg-purple-50 text-purple-600 border-purple-100'
            }`}>
              <Award size={18} className="fill-current" />
              <span className="font-bold">{t('mindful', language)}</span>
            </div>
          )}
        </div>
      </header>

      {/* ===== TODAY'S MENTAL STATE SUMMARY (AI-generated) ===== */}
      <div className={`p-4 sm:p-5 rounded-3xl border flex items-center gap-3 sm:gap-4 animate-slide-up stagger-1 ${
        darkMode
          ? 'bg-gradient-to-r from-primary-900/30 to-purple-900/20 border-primary-800/40'
          : 'bg-gradient-to-r from-primary-50/80 to-purple-50/60 border-primary-100/60'
      }`}>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl animate-float shrink-0 ${
          darkMode ? 'bg-slate-800/80' : 'bg-white/80'
        } shadow-sm`}>
          {moodEmoji[currentMood] || '😌'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-wider mb-0.5 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
            {t('todaysMentalState', language)}
          </h3>
          <p className={`font-medium text-sm sm:text-base truncate sm:whitespace-normal ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            {weeklySummary}
          </p>
        </div>
        <Sparkles size={18} className={`animate-pulse shrink-0 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`} />
      </div>
      
      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {/* Current Mood card */}
        <div className={`${cardClass} ${cardShadow} p-5 sm:p-6 rounded-3xl border flex flex-col justify-between transition-all hover:-translate-y-1 hover-glow animate-slide-up stagger-2`}>
          <h3 className={`font-medium flex items-center gap-2 text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('currentMood', language)}</h3>
          <div className="mt-3 sm:mt-4 flex items-center gap-3">
            <span className="text-4xl sm:text-5xl drop-shadow-sm animate-float">{moodEmoji[currentMood] || '😊'}</span>
            <span className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t(moodLabelKey[currentMood] || 'calm', language)}</span>
          </div>
        </div>

        {/* Stress Level card */}
        <div className={`${cardClass} ${cardShadow} p-5 sm:p-6 rounded-3xl border flex flex-col justify-between transition-all hover:-translate-y-1 hover-glow animate-slide-up stagger-3`}>
          <h3 className={`font-medium text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('stressLevel', language)}</h3>
          <div className="mt-3 sm:mt-4">
            <div className={`flex justify-between text-sm mb-2 font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <span>{t(stressLabel, language)}</span>
              <span className={stressColor}>{stressLevel}%</span>
            </div>
            <div className={`w-full rounded-full h-3 overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className={`${stressBarColor} h-full rounded-full shadow-sm transition-all duration-700`} style={{ width: `${stressLevel}%` }}></div>
            </div>
          </div>
        </div>

        {/* Tip of the Day card — AI-generated */}
        <div className={`sm:col-span-2 md:col-span-1 p-5 sm:p-6 rounded-3xl shadow-sm border flex flex-col justify-between transition-all hover:-translate-y-1 hover-glow animate-slide-up stagger-4 ${
          darkMode ? 'bg-primary-900/30 border-primary-800/50' : 'bg-primary-50 border-primary-100'
        }`}>
          <h3 className={darkMode ? 'text-primary-400 font-medium' : 'text-primary-600 font-medium'}>{t('tipOfTheDay', language)}</h3>
          <p className={`mt-2 sm:mt-3 font-medium leading-relaxed text-sm sm:text-base ${darkMode ? 'text-primary-300' : 'text-primary-800'}`}>
            {tipOfTheDay}
          </p>
        </div>
      </div>

      {/* ===== AI COMPANION SECTION (dynamic insights) ===== */}
      <div className={`p-5 sm:p-6 rounded-3xl border animate-slide-up stagger-5 ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700/50' 
          : 'bg-gradient-to-br from-white/80 to-primary-50/40 border-white/60'
      } ${cardShadow}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-2xl ${darkMode ? 'bg-primary-900/50' : 'bg-primary-100'}`}>
            <Brain size={20} className={darkMode ? 'text-primary-400' : 'text-primary-600'} />
          </div>
          <h2 className={`text-base sm:text-lg font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('aiCompanionTitle', language)}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {aiInsights.length > 0 ? (
            aiInsights.slice(0, 4).map((tip, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 sm:p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
                darkMode 
                  ? 'bg-slate-700/50 border-slate-600/50' 
                  : 'bg-white/60 border-slate-100'
              }`}>
                <Heart size={16} className={`mt-0.5 flex-shrink-0 ${darkMode ? 'text-pink-400' : 'text-pink-500'}`} />
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{tip}</p>
              </div>
            ))
          ) : (
            <div className={`col-span-full flex items-center gap-3 p-4 rounded-2xl border ${
              darkMode ? 'bg-slate-700/50 border-slate-600/50' : 'bg-white/60 border-slate-100'
            }`}>
              <Sparkles size={16} className={darkMode ? 'text-primary-400' : 'text-primary-500'} />
              <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {language === 'ur'
                  ? 'اپنا موڈ لاگ کرتے رہیں — بصیرتیں جلد ظاہر ہوں گی۔'
                  : 'Keep logging your mood — insights will appear here soon.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== SUGGESTIONS WITH XAI LABELS ===== */}
      <div>
        <h2 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('personalizedSuggestions', language)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
          <button 
            onClick={() => setIsBreathingOpen(true)} 
            className={`${cardClass} ${cardShadow} p-4 sm:p-5 rounded-3xl border hover:shadow-lg transition-all text-left flex items-start gap-3 sm:gap-4 group hover-glow`}
          >
            <div className="bg-accent-teal/10 w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-2xl text-accent-teal group-hover:scale-110 transition-transform">
              <Zap size={22} className="fill-current" />
            </div>
            <div className="min-w-0">
              <h3 className={`font-bold mb-1 text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('guidedBreathing', language)}</h3>
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('guidedBreathingDesc', language)}</p>
              {/* XAI Label */}
              <p className={`text-xs mt-2 italic flex items-center gap-1 ${darkMode ? 'text-accent-teal/70' : 'text-accent-teal/80'}`}>
                <Sparkles size={12} />
                {t(xaiBreathingKey, language)}
              </p>
            </div>
          </button>
          
          <Link to="/journal" className={`${cardClass} ${cardShadow} p-4 sm:p-5 rounded-3xl border hover:shadow-lg transition-all text-left flex items-start gap-3 sm:gap-4 group hover-glow`}>
            <div className="bg-purple-50 w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-2xl text-purple-500 group-hover:scale-110 transition-transform">
              <Award size={22} className="fill-current" />
            </div>
            <div className="min-w-0">
              <h3 className={`font-bold mb-1 text-sm sm:text-base ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('practiceGratitude', language)}</h3>
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('practiceGratitudeDesc', language)}</p>
              {/* XAI Label */}
              <p className={`text-xs mt-2 italic flex items-center gap-1 ${darkMode ? 'text-purple-400/70' : 'text-purple-500/80'}`}>
                <Sparkles size={12} />
                {t(xaiGratitudeKey, language)}
              </p>
            </div>
          </Link>
        </div>

        <h2 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('quickActions', language)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/chat" className={`${cardClass} ${cardShadow} p-4 sm:p-5 rounded-3xl border hover:shadow-lg transition-all hover:-translate-y-1 flex items-center justify-between group hover-glow`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-50 p-2.5 sm:p-3 rounded-xl text-blue-500">
                <MessageSquare size={22} />
              </div>
              <span className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('chatWithAI', language)}</span>
            </div>
            <ArrowRight className={`group-hover:text-blue-500 transition-colors ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} />
          </Link>

          <Link to="/mood-tracker" className={`${cardClass} ${cardShadow} p-4 sm:p-5 rounded-3xl border hover:shadow-lg transition-all hover:-translate-y-1 flex items-center justify-between group hover-glow`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-accent-teal/10 p-2.5 sm:p-3 rounded-xl text-accent-teal">
                <PlusCircle size={22} />
              </div>
              <span className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('logYourMood', language)}</span>
            </div>
            <ArrowRight className={`group-hover:text-accent-teal transition-colors ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} />
          </Link>
        </div>
      </div>
    </div>
  );
}
