import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../translations';
import { saveJournal, getJournals } from '../services/api';
import { BookOpen, Clock, Sparkles } from 'lucide-react';
import WebcamEmotion from '../components/WebcamEmotion';

export default function Journal() {
  const { darkMode, language, setCurrentMood } = useApp();
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSuggestion, setLastSuggestion] = useState('');
  const [cbtReframe, setCbtReframe] = useState('');
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [webcamEmotion, setWebcamEmotion] = useState('');
  const [webcamConfidence, setWebcamConfidence] = useState(0);

  // Load journal entries on mount
  useEffect(() => {
    getJournals()
      .then(res => setEntries(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!content.trim() || saving) return;
    setSaving(true);
    try {
      const res = await saveJournal(content.trim());
      setEntries(prev => [res.data, ...prev]);
      setLastSuggestion(res.data.ai_suggestion);
      if (res.data.emotion) setDetectedEmotion(res.data.emotion);
      if (res.data.cbt?.has_distortion) setCbtReframe(res.data.cbt.reframe);
      setContent('');
    } catch {
      alert('Failed to save journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-6 animate-fade-in flex flex-col h-full ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('journalTitle', language)}</h1>
        <p className={`text-sm sm:text-base mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('journalSubtitle', language)}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Webcam emotion panel */}
        <div className="md:col-span-1">
          <WebcamEmotion
            onEmotionDetected={(emotion, confidence) => {
                setWebcamEmotion(emotion);
                setWebcamConfidence(confidence);
                // also update global mood from face
                setCurrentMood(
                  emotion === 'joy'     ? 'happy'   :
                  emotion === 'sadness' ? 'sad'     :
                  emotion === 'fear'    ? 'anxious' :
                  emotion === 'anger'   ? 'stressed': 'calm'
                );
              }}
            />

            {/* Show live face emotion card */}
            {webcamEmotion && (
              <div className={`mt-3 p-3 rounded-2xl border flex items-center gap-3 ${
                darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-100'
              }`}>
                <span className="text-2xl">
                  {{ joy:'😄', sadness:'😢', anger:'😠', fear:'😨',
                    surprise:'😲', disgust:'🤢', neutral:'😐' }[webcamEmotion]}
                </span>
                <div>
                  <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Face detected: <span className="capitalize">{webcamEmotion}</span>
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Confidence: {webcamConfidence.toFixed(0)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Journal textarea — takes remaining 2 columns */}
          <div className="md:col-span-2">
            {/* Write new entry */}
            <div className={`backdrop-blur-xl p-5 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col transition-colors h-full ${darkMode
              ? 'bg-slate-800/70 border-slate-700/50'
              : 'bg-white/70 border-white/50'
              }`}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('journalPlaceholder', language)}
                rows={5}
                className={`w-full resize-none rounded-2xl p-4 sm:p-6 border focus:ring-2 focus:ring-primary-300 outline-none text-sm sm:text-lg transition-all leading-relaxed flex-grow ${darkMode
                  ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
              ></textarea>

              {/* AI Suggestion */}
              {lastSuggestion && (
                <div className={`mt-4 p-4 rounded-2xl border flex items-start gap-3 animate-slide-up ${darkMode ? 'bg-primary-900/20 border-primary-800/30' : 'bg-primary-50 border-primary-100'
                  }`}>
                  <Sparkles size={18} className={`shrink-0 mt-0.5 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                  <p className={`text-sm font-medium ${darkMode ? 'text-primary-300' : 'text-primary-800'}`}>{lastSuggestion}</p>
                </div>
              )}
              {detectedEmotion && (
                <div className={`mt-3 flex items-center gap-2 text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                  <span>Detected emotion:</span>
                  <span className={`px-2 py-0.5 rounded-full ${darkMode ? 'bg-slate-700 text-primary-400' : 'bg-primary-50 text-primary-600'
                    }`}>{detectedEmotion}</span>
                </div>
              )}

              {cbtReframe && (
                <div className={`mt-3 p-4 rounded-2xl border flex items-start gap-3 animate-slide-up ${darkMode ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-100'
                  }`}>
                  <span className="text-lg shrink-0">🧠</span>
                  <div>
                    <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      CBT Reframe
                    </p>
                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {cbtReframe}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 sm:mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving || !content.trim()}
                  className={`px-8 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-md ${(saving || !content.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {saving ? 'Saving...' : t('saveEntry', language)}
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Past entries */}
      <div>
        <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
          <BookOpen size={20} /> Past Entries
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : entries.length === 0 ? (
          <p className={`text-center py-8 text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No journal entries yet. Start writing above! ✨</p>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className={`p-4 sm:p-5 rounded-2xl border transition-all hover:shadow-md ${darkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/60 border-white/50'
                }`}>
                <p className={`text-sm sm:text-base leading-relaxed line-clamp-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {entry.content}
                </p>
                {entry.ai_suggestion && (
                  <p className={`mt-2 text-xs italic flex items-center gap-1.5 ${darkMode ? 'text-primary-400/70' : 'text-primary-500/70'}`}>
                    <Sparkles size={12} /> {entry.ai_suggestion}
                  </p>
                )}
                <p className={`mt-2 text-xs flex items-center gap-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Clock size={12} /> {formatDate(entry.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
