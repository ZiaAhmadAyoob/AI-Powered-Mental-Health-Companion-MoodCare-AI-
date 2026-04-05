import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square, AlertTriangle, Phone, Heart, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../translations';
import { sendChatMessage, getChatHistory } from '../services/api';
import { SpeechToText, TextToSpeech } from '../services/voiceService';

// Emotion configs
const emotions = {
  happy:   { emoji: '😄', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dotColor: 'bg-emerald-500', darkColor: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' },
  anxious: { emoji: '😟', color: 'bg-amber-50 text-amber-600 border-amber-100', dotColor: 'bg-amber-500', darkColor: 'bg-amber-900/30 text-amber-400 border-amber-800/50' },
  sad:     { emoji: '😞', color: 'bg-blue-50 text-blue-600 border-blue-100', dotColor: 'bg-blue-500', darkColor: 'bg-blue-900/30 text-blue-400 border-blue-800/50' },
  calm:    { emoji: '😌', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dotColor: 'bg-emerald-500', darkColor: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' },
  stressed:{ emoji: '😰', color: 'bg-red-50 text-red-600 border-red-100', dotColor: 'bg-red-500', darkColor: 'bg-red-900/30 text-red-400 border-red-800/50' },
};

function detectEmotion(text) {
  const lower = text.toLowerCase();
  if (/stress|overwhelm|pressure|tense|burden|تناؤ|دباؤ|بوجھ/.test(lower)) return 'stressed';
  if (/sad|depress|cry|lonely|down|hurt|اداس|تنہا|رونا/.test(lower)) return 'sad';
  if (/anxi|worry|nervous|scared|fear|panic|فکر|خوف|گھبراہٹ/.test(lower)) return 'anxious';
  if (/happy|great|amazing|wonderful|joy|excited|good|خوش|بہترین|خوشی/.test(lower)) return 'happy';
  if (/آرام|سکون|relax/.test(lower)) return 'calm';
  return 'calm';
}

function detectCrisis(text) {
  const lower = text.toLowerCase();
  return /suicid|kill myself|end it all|don't want to live|self.?harm|خودکشی|مرنا/.test(lower);
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Chat() {
  const [isRecording, setIsRecording] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('calm');
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const { darkMode, language, setCurrentMood, setStressLevel, userProfile, isAuthenticated } = useApp();
  const messagesEndRef = useRef(null);
  const historyLoadedRef = useRef(false); 
  const [voiceMode,   setVoiceMode]   = useState(false);
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [transcript,  setTranscript]  = useState('');
  const sttRef = useRef(null);
  const ttsRef = useRef(new TextToSpeech());

  const firstName = userProfile?.name?.split(' ')[0] || 'User';

  // Load chat history from backend on mount
  useEffect(() => {
    if (isAuthenticated) {
      getChatHistory()
        .then(res => {
          if (!res.data) return;
          const history = res.data.map(msg => ({
            id: msg.id,
            sender: msg.sender,
            text: msg.message,
            time: msg.created_at,
            emotion: msg.emotion,
          }));
          setMessages(history);

          // Set current emotion from last user message
          const lastUser = [...history].reverse().find(m => m.sender === 'user');
          if (lastUser && lastUser.emotion) {
            setCurrentEmotion(lastUser.emotion);
          }
        })
        .catch(() => {
          // Fallback welcome message
          setMessages([{
            id: 'welcome',
            sender: 'ai',
            text: `Hi ${firstName}! 👋 I'm your MoodCare AI companion. How are you feeling today?`,
            time: new Date().toISOString(),
          }]);
        })
        .finally(() => {
          setLoadingHistory(false);
          historyLoadedRef.current = true;
        });
    } else {
      setLoadingHistory(false);
      setMessages([{
        id: 'welcome',
        sender: 'ai',
        text: `Hi! 👋 I'm your MoodCare AI companion. Please log in to save your progress!`,
        time: new Date().toISOString(),
      }]);
    }
  }, [firstName, isAuthenticated]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollParent = messagesEndRef.current.closest('.overflow-y-auto');
      if (scrollParent) {
        scrollParent.scrollTo({
          top: scrollParent.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, isTyping]);

  // Detect emotion from messages — only for new messages, not history load
  useEffect(() => {
    if (!historyLoadedRef.current) return; // Skip during initial history load
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg) {
      const emotion = lastUserMsg.emotion || detectEmotion(lastUserMsg.text);
      setCurrentEmotion(emotion);
      setCurrentMood(emotion);
      if (detectCrisis(lastUserMsg.text)) {
        setShowCrisisAlert(true);
      }
    }
  }, [messages, setCurrentMood]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: text.trim(), time: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      setError(null);
      const res = await sendChatMessage(text.trim());
      const data = res.data;
      
      if (!data || !data.ai_message) {
        throw new Error("Invalid response from server");
      }

      const aiMsg = data.ai_message;

      // update global mood state from AI response
      setCurrentMood(aiMsg.emotion || 'calm');

      setMessages(prev => [...prev, {
        id: aiMsg.id || Date.now(),
        sender: 'ai',
        text: aiMsg.message,
        time: aiMsg.created_at || new Date().toISOString(),
        emotion: aiMsg.emotion,
      }]);

      if (voiceMode && aiMsg.message) {
        const utt = ttsRef.current.speak(aiMsg.message, aiMsg.emotion || 'neutral');
        setIsSpeaking(true);
        if (utt) {
          utt.onend = () => setIsSpeaking(false);
          utt.onerror = () => setIsSpeaking(false);
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError("Connection lost. Please check your internet.");
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm having trouble connecting right now. Please try again in a moment. 💙",
        time: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      // stop recording
      sttRef.current?.stop();
      setIsRecording(false);
      setTranscript('');
      return;
    }

    // stop AI speaking if it is
    if (isSpeaking) {
      ttsRef.current.stop();
      setIsSpeaking(false);
    }

    setTranscript('');

    sttRef.current = new SpeechToText(
      (text, isFinal) => {
        setInputValue(text);
        setTranscript(text);

        if (isFinal && text.trim()) {
          setIsRecording(false);
          setTranscript('');
          handleSendMessage(text.trim());
        }
      },
      (err) => {
        setIsRecording(false);
        if (err !== 'no-speech') {
          setError(err === 'not-allowed' ? "Microphone access denied" : "Speech error occurred");
          console.warn('Speech recognition error:', err);
        }
      }
    );

    if (sttRef.current) {
      sttRef.current.start();
      setIsRecording(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const em = emotions[currentEmotion] || emotions.calm;

  const chips = [
    { key: 'chipStressed', fallback: 'I feel stressed' },
    { key: 'chipAdvice', fallback: 'Give me advice' },
    { key: 'chipRelax', fallback: 'Help me relax' },
    { key: 'chipAnxious', fallback: 'I feel anxious' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] animate-fade-in">
      <header className="mb-3 md:mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('aiTherapist', language)}</h1>
          <p className={`mt-0.5 text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('yourSafeSpace', language)}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice toggle button */}
          <button
            onClick={() => setVoiceMode(v => !v)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${voiceMode
                ? 'bg-primary-600 text-white border-primary-600 shadow-md ring-2 ring-primary-500/20'
                : darkMode
                  ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
          >
            {voiceMode ? '🔊 Voice On' : '🔇 Voice Off'}
          </button>

          <div className={`${darkMode ? em.darkColor : em.color} px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border shadow-sm flex items-center gap-2 transition-all duration-500 w-fit`}>
            <span className={`w-2 h-2 rounded-full ${em.dotColor} animate-pulse`}></span>
            <span>{em.emoji}</span>
            {t(currentEmotion, language)}
          </div>
        </div>
      </header>
      
      {showCrisisAlert && (
        <div className={`mb-3 md:mb-4 p-4 sm:p-5 rounded-3xl shadow-lg flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4 animate-scale-in border ${
          darkMode
            ? 'bg-gradient-to-r from-red-900/40 to-pink-900/30 border-red-800/50'
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-100'
        }`}>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`p-2.5 sm:p-3 rounded-2xl flex-shrink-0 ${darkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
              <Heart className={`${darkMode ? 'text-red-400' : 'text-red-500'} fill-current`} size={22} />
            </div>
            <div>
              <p className={`font-bold text-sm sm:text-base mb-1 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                {t('crisisDetected', language)}
              </p>
              <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-red-700'}`}>
                {t('crisisMessage', language)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowCrisisAlert(false)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 sm:px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <Phone size={16} />
              {t('contactHelpline', language)}
            </button>
            <button 
              onClick={() => setShowCrisisAlert(false)}
              className={`p-2.5 rounded-xl transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <Shield size={16} />
            </button>
          </div>
        </div>
      )}

      <div className={`flex-1 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col overflow-hidden ${
        darkMode 
          ? 'bg-slate-800/60 border-slate-700/50' 
          : 'bg-white/60 border-white/50'
      }`}>
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-transparent">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${Math.min(idx * 50, 500)}ms` }}>
                <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-xl">
                  <div className={
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-3xl rounded-tr-sm shadow-md font-medium leading-relaxed text-sm sm:text-base'
                      : `px-4 sm:px-6 py-3 sm:py-4 rounded-3xl rounded-tl-sm border shadow-sm leading-relaxed text-sm sm:text-base ${
                          darkMode 
                            ? 'bg-slate-700/80 text-slate-200 border-slate-600/60' 
                            : 'bg-white/80 backdrop-blur-md text-slate-800 border-white/60'
                        }`
                  }>
                    <p>{msg.text}</p>
                    {msg.cbt?.has_distortion && (
                      <div className={`mt-2 pt-2 border-t text-xs italic ${
                          darkMode ? 'border-slate-600 text-primary-300' : 'border-blue-100 text-primary-600'
                        }`}>
                        💡 {msg.cbt.reframe}
                      </div>
                    )}
                    {msg.emotion && (
                      <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${
                          darkMode ? 'bg-slate-600 text-slate-400' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {msg.emotion}{msg.stress ? ` · ${msg.stress}%` : ''}
                        </span>
                      )}
                  </div>
                  <span className={`text-[11px] px-2 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  } ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {formatTime(msg.time)}
                  </span>
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className={`px-4 sm:px-6 py-3 sm:py-4 rounded-3xl rounded-tl-sm border shadow-sm ${
                darkMode 
                  ? 'bg-slate-700/80 border-slate-600/60' 
                  : 'bg-white/80 backdrop-blur-md border-white/60'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-bounce ${darkMode ? 'bg-primary-400' : 'bg-primary-500'}`} style={{ animationDelay: '0ms' }}></span>
                    <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-bounce ${darkMode ? 'bg-primary-400' : 'bg-primary-500'}`} style={{ animationDelay: '150ms' }}></span>
                    <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-bounce ${darkMode ? 'bg-primary-400' : 'bg-primary-500'}`} style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('aiIsTyping', language)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex justify-center animate-fade-in">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-sm border ${darkMode ? 'bg-primary-900/30 text-primary-400 border-primary-800/40' : 'bg-primary-50 text-primary-600 border-primary-100'
                }`}>
                <span className="animate-pulse">🔊</span>
                AI is speaking...
                <button
                  onClick={() => { ttsRef.current.stop(); setIsSpeaking(false); }}
                  className="ml-1 underline opacity-70 hover:opacity-100"
                >
                  Stop
                </button>
              </div>
            </div>
          )}

          {/* Live transcript indicator */}
          {isRecording && transcript && (
            <div className="flex justify-end animate-fade-in">
              <div className={`px-4 py-2 rounded-2xl rounded-tr-sm text-sm italic shadow-sm border ${darkMode ? 'bg-slate-700/80 text-slate-300 border-slate-600/50' : 'bg-white/80 text-slate-500 border-slate-100'
                }`}>
                🎤 {transcript}...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
        
        {/* Error display */}
        {error && (
          <div className={`mx-3 sm:mx-6 mb-2 p-2.5 rounded-2xl text-center text-xs font-bold animate-shake border ${darkMode ? 'bg-red-900/30 text-red-400 border-red-800/50' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
            ⚠️ {error}
          </div>
        )}

        <div className={`p-3 sm:p-4 backdrop-blur-md border-t ${
          darkMode 
            ? 'bg-slate-800/40 border-slate-700/40' 
            : 'bg-white/40 border-white/40'
        }`}>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3 px-1">
            {chips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => handleSendMessage(t(chip.key, language))}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all hover:scale-[1.03] active:scale-95 border shadow-sm hover-glow ${
                  darkMode
                    ? 'bg-slate-700 text-primary-400 border-slate-600 hover:bg-slate-600 hover:text-primary-300'
                    : 'bg-white/80 text-primary-600 border-primary-100 hover:bg-primary-50 hover:border-primary-200'
                }`}
              >
                {t(chip.key, language)}
              </button>
            ))}
          </div>

          <div className={`relative flex items-center rounded-full border px-2 sm:px-3 py-1.5 sm:py-2 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-400 transition-all shadow-sm group ${
            darkMode 
              ? 'bg-slate-700 border-slate-600' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('typeYourMessage', language)}
              className={`flex-1 bg-transparent border-none outline-none py-1.5 sm:py-2 px-2 sm:px-4 text-sm sm:text-lg min-w-0 ${
                darkMode ? 'text-slate-200 placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'
              }`}
            />
            <div className="flex gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={handleMicClick}
                className={`p-2 sm:p-3 rounded-full transition-all shadow-sm border ${
                  isRecording
                    ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100 animate-pulse'
                    : darkMode
                      ? 'bg-slate-600 text-slate-300 border-slate-500 hover:bg-slate-500'
                      : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                }`}
              >
                {isRecording
                  ? <Square size={18} className="fill-current sm:w-[22px] sm:h-[22px]"/>
                  : <Mic size={18} className="stroke-[2.5] sm:w-[22px] sm:h-[22px]"/>
                }
              </button>


              <button 
                onClick={() => handleSendMessage(inputValue)}
                className="p-2 sm:p-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-full transition-all shadow-md hover:shadow-lg hover-glow"
              >
                <Send size={18} className="ml-0.5 stroke-[2.5] sm:w-[22px] sm:h-[22px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
