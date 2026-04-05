import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../translations';

export default function BreathingExercise({ isOpen, onClose }) {
  const [phase, setPhase] = useState('idle'); // idle, inhale, hold1, exhale, hold2
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { darkMode, language } = useApp();

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // cycle phases: inhale (4s) -> hold (4s) -> exhale (4s) -> hold (4s)
            if (phase === 'idle' || phase === 'hold2') {
              setPhase('inhale');
              return 4;
            } else if (phase === 'inhale') {
              setPhase('hold1');
              return 4;
            } else if (phase === 'hold1') {
              setPhase('exhale');
              return 4;
            } else if (phase === 'exhale') {
              setPhase('hold2');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, phase]);

  const togglePlay = () => {
    if (!isPlaying && phase === 'idle') {
      setPhase('inhale');
      setTimeLeft(4);
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setIsPlaying(false);
    setPhase('idle');
    setTimeLeft(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in p-4">
      <div className={`rounded-3xl p-8 max-w-sm w-full shadow-2xl relative flex flex-col items-center text-center ${
        darkMode ? 'bg-slate-800' : 'bg-white'
      }`}>
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            darkMode 
              ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' 
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
        >
          <X size={20} />
        </button>

        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('boxBreathing', language)}</h2>
        <p className={`mb-8 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('breathingDesc', language)}</p>

        {/* Breathing Animation Circle */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
          <div className={`absolute inset-0 rounded-full bg-accent-teal/20 transition-all duration-1000 ease-in-out
            ${phase === 'inhale' ? 'scale-150 opacity-100' : ''}
            ${phase === 'hold1' ? 'scale-150 opacity-80' : ''}
            ${phase === 'exhale' ? 'scale-100 opacity-100' : ''}
            ${phase === 'hold2' ? 'scale-100 opacity-60' : ''}
            ${phase === 'idle' ? 'scale-100 opacity-20' : ''}
          `}></div>
          <div className="absolute inset-4 rounded-full bg-accent-teal/30"></div>
          <div className="absolute inset-8 rounded-full border-4 border-accent-teal/40 border-dashed animate-spin-slow"></div>
          
          <div className={`relative z-10 rounded-full w-24 h-24 shadow-md flex flex-col items-center justify-center text-accent-teal ${
            darkMode ? 'bg-slate-700' : 'bg-white'
          }`}>
            <span className="text-xl font-bold capitalize">
              {phase === 'idle' ? t('ready', language) : phase.replace('1', '').replace('2', '')}
            </span>
            {phase !== 'idle' && <span className="text-2xl font-bold">{timeLeft}s</span>}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={togglePlay}
            className="w-14 h-14 flex items-center justify-center bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
          </button>
          <button 
            onClick={reset}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors shadow-sm ${
              darkMode 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
