import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../translations';
import { Brain, TrendingUp, Lightbulb } from 'lucide-react';
import { getInsights, getPrediction } from '../services/api';

export default function Insights() {
  const { darkMode, language } = useApp();
  const [data, setData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardClass = darkMode
    ? 'bg-slate-800/70 backdrop-blur-xl border-slate-700/50'
    : 'bg-white/70 backdrop-blur-xl border-white/50';

  const days = [
    t('mon', language), t('tue', language), t('wed', language),
    t('thu', language), t('fri', language), t('sat', language), t('sun', language)
  ];

  useEffect(() => {
    Promise.all([
      getInsights(),
      getPrediction(),
    ])
      .then(([insightsRes, predRes]) => {
        setData(insightsRes.data);
        setPrediction(predRes.data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Compute chart bar heights from real mood data
  const getMoodBars = () => {
    if (!data || !data.weekly_moods || data.weekly_moods.length === 0) {
      return [40, 65, 30, 75, 50, 85, 60]; // fallback
    }
    // Group moods by day of week (0=Mon...6=Sun)
    const dayScores = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const moodScoreMap = { happy: 90, calm: 70, anxious: 40, sad: 25, stressed: 30 };

    data.weekly_moods.forEach(m => {
      const d = new Date(m.created_at);
      const dayIdx = (d.getDay() + 6) % 7; // 0=Mon
      dayScores[dayIdx] += moodScoreMap[m.mood_state] || 50;
      dayCounts[dayIdx] += 1;
    });

    return dayScores.map((score, i) => dayCounts[i] > 0 ? Math.round(score / dayCounts[i]) : 0);
  };

  const moodBars = getMoodBars();
  const stressPercent = data ? Math.round(data.average_stress) : 30;
  const stressDash = 251 - (251 * stressPercent / 100);

  // Generate calendar colors from weekly moods (stable — no Math.random)
  const calendarColors = useMemo(() => {
    const moodColorMap = { happy: 'bg-green-400', calm: 'bg-emerald-300', anxious: 'bg-yellow-400', stressed: 'bg-red-400', sad: 'bg-blue-400' };
    if (!data || !data.weekly_moods || data.weekly_moods.length === 0) {
      // Stable fallback pattern instead of random colors
      const fallbackColors = ['bg-green-400', 'bg-emerald-300', 'bg-yellow-400', 'bg-red-400', 'bg-blue-400'];
      return Array.from({ length: 28 }, (_, i) => i === 27 ? (darkMode ? 'bg-slate-700' : 'bg-slate-100') : fallbackColors[i % fallbackColors.length]);
    }
    // Map actual moods to last 28 days
    const colors = Array.from({ length: 28 }, () => darkMode ? 'bg-slate-700' : 'bg-slate-100');
    data.weekly_moods.forEach(m => {
      const d = new Date(m.created_at);
      const today = new Date();
      const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 28) {
        colors[27 - diff] = moodColorMap[m.mood_state] || 'bg-slate-300';
      }
    });
    return colors;
  }, [data, darkMode]);

  // AI Insight cards — dynamic text based on real data
  const getInsightText = (key) => {
    if (!data) return t(key, language);
    if (key === 'aiInsightMood') {
      const dist = data.mood_distribution;
      const top = Object.entries(dist).sort((a, b) => b[1] - a[1])[0];
      if (top) return `Your most frequent mood is "${top[0]}" with ${top[1]} entries. Keep tracking to see patterns! 📊`;
      return 'Start logging moods to see patterns here! 📊';
    }
    if (key === 'aiInsightStress') {
      return `Your average stress level is ${Math.round(data.average_stress)}%. ${data.average_stress > 50 ? 'Consider trying breathing exercises! 🌿' : 'You\'re doing great managing stress! 🌟'}`;
    }
    if (key === 'aiInsightPattern') {
      return `You've logged ${data.total_moods} moods, written ${data.total_journals} journal entries, and had ${data.total_chats} conversations. ${data.streak_days > 0 ? `Current streak: ${data.streak_days} days! 🔥` : 'Start a streak by logging daily! 🎯'}`;
    }
    return t(key, language);
  };

  const aiInsights = [
    { key: 'aiInsightMood', icon: TrendingUp, color: 'text-blue-500', bgColor: darkMode ? 'bg-blue-900/20' : 'bg-blue-50' },
    { key: 'aiInsightStress', icon: Lightbulb, color: 'text-amber-500', bgColor: darkMode ? 'bg-amber-900/20' : 'bg-amber-50' },
    { key: 'aiInsightPattern', icon: Brain, color: 'text-purple-500', bgColor: darkMode ? 'bg-purple-900/20' : 'bg-purple-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-5 sm:space-y-6 animate-fade-in h-full flex flex-col ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold">{t('insightsTitle', language)}</h1>
        <p className={`text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('insightsSubtitle', language)}</p>
      </header>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {aiInsights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div key={i} className={`${insight.bgColor} p-3 sm:p-4 rounded-2xl border flex items-start gap-3 transition-all hover:scale-[1.02] hover-glow animate-slide-up ${darkMode ? 'border-slate-700/50' : 'border-slate-100'
              }`} style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`p-2 rounded-xl shrink-0 ${darkMode ? 'bg-slate-800/80' : 'bg-white/80'} shadow-sm`}>
                <Icon size={18} className={insight.color} />
              </div>
              <p className={`text-xs sm:text-sm font-medium leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {getInsightText(insight.key)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className={`${cardClass} p-4 sm:p-6 justify-center flex items-center rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex-col hover:opacity-90 transition-colors hover-glow`}>
          <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 w-full ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('moodTrends', language)}</h3>
          <div className={`flex-1 w-full rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3 p-4 sm:p-6 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'
            }`}>
            <div className="flex items-end gap-1.5 sm:gap-2 h-20">
              {moodBars.map((h, i) => (
                <div key={i} className={`w-4 sm:w-6 rounded-t-lg transition-all duration-500 ${h > 60 ? 'bg-green-400' : h > 40 ? 'bg-yellow-400' : h > 0 ? 'bg-red-400' : (darkMode ? 'bg-slate-600' : 'bg-slate-200')
                  }`} style={{ height: `${Math.max(h, 5)}%`, animationDelay: `${i * 100}ms` }}></div>
              ))}
            </div>
            <div className="flex gap-1.5 sm:gap-2 w-full justify-around">
              {days.map((d, i) => (
                <span key={i} className={`text-[10px] sm:text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={`${cardClass} p-4 sm:p-6 justify-center flex items-center rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex-col hover:opacity-90 transition-colors hover-glow`}>
          <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 w-full ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('stressScore', language)}</h3>
          <div className={`flex-1 w-full rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3 p-4 sm:p-6 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'
            }`}>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={stressPercent > 60 ? '#ef4444' : stressPercent > 30 ? '#eab308' : '#14b8a6'} strokeWidth="8" strokeDasharray="251" strokeDashoffset={stressDash} strokeLinecap="round" transform="rotate(-90 50 50)" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{stressPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`lg:col-span-2 ${cardClass} p-4 sm:p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col hover:opacity-90 transition-colors`}>
          <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 w-full ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('emotionCalendar', language)}</h3>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-4 flex-1">
            {days.map(day => (
              <div key={day} className={`text-center text-[10px] sm:text-sm font-bold mb-1 sm:mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{day}</div>
            ))}
            {calendarColors.map((color, i) => (
              <div key={i} className={`aspect-square rounded-lg sm:rounded-xl ${color} opacity-80 hover:opacity-100 hover:scale-105 transition-all cursor-pointer shadow-sm`}></div>
            ))}
          </div>
          <div className={`mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400"></span> {t('happy', language)}</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-300"></span> {t('calm', language)}</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></span> {t('anxious', language)}</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400"></span> {t('angry', language)}</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-400"></span> {t('sad', language)}</div>
          </div>
        </div>

        <div className={`lg:col-span-2 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col md:flex-row gap-4 sm:gap-6 items-center ${darkMode
            ? 'bg-primary-900/20 border-primary-800/30'
            : 'bg-gradient-to-r from-primary-50/80 to-primary-100/50 border-white/50'
          }`}>
          <div className={`p-3 sm:p-4 rounded-3xl shadow-sm text-3xl sm:text-4xl border animate-float shrink-0 ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/60'
            }`}>
            🧠
          </div>
          {/* // ADD this block right before the aiWeeklyObservation section: */}
          {prediction?.predicted_mood && (
            <div className={`lg:col-span-2 p-4 sm:p-6 rounded-3xl border flex items-start gap-4 hover-glow ${darkMode ? 'bg-amber-900/20 border-amber-800/30' : 'bg-amber-50 border-amber-100'
              }`}>
              <div className={`p-3 rounded-2xl text-2xl shrink-0 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                🔮
              </div>
              <div>
                <h3 className={`font-bold text-sm mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  Tomorrow's forecast
                </h3>
                <p className={`font-semibold text-base mb-1 capitalize ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {prediction.predicted_mood}
                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${prediction.stress_risk === 'high'
                      ? 'bg-red-100 text-red-600'
                      : prediction.stress_risk === 'moderate'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                    Stress: {prediction.stress_risk}
                  </span>
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {prediction.insight}
                </p>
              </div>
            </div>
          )}
          <div>
            <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-primary-400' : 'text-primary-800'}`}>{t('aiWeeklyObservation', language)}</h3>
            <p className={`mt-1 sm:mt-2 font-medium text-sm sm:text-base ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {data && data.total_moods > 0
                ? `Based on ${data.total_moods} mood logs, your emotional health is being tracked. ${data.average_stress > 50 ? 'Consider incorporating more relaxation into your routine.' : 'You\'re managing well — keep up the great work!'} ${data.streak_days > 0 ? `You're on a ${data.streak_days}-day streak! 🔥` : ''}`
                : t('weeklyObservationText', language)
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
