import React from 'react';
import { Phone, MessageCircle, Globe, X, Heart, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CrisisModal({ isOpen, onClose }) {
  const { darkMode } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
      
      <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in ${
        darkMode ? 'bg-slate-800 border border-slate-700/50' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="bg-red-500 p-6 flex items-start justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-bold">You are not alone.</h2>
            </div>
            <p className="text-red-50 font-medium">
              If you or someone you know is going through a tough time, please reach out. Help is available 24/7.
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors relative z-10 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* US National Line */}
          <div className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 transition-colors ${
            darkMode ? 'bg-slate-700/30 border-red-900/50 hover:bg-slate-700/50' : 'bg-red-50 border-red-100 hover:bg-red-100/50'
          }`}>
            <div>
              <h3 className={`font-bold text-lg mb-1 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                National Suicide & Crisis Lifeline
              </h3>
              <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Free, confidential support available 24/7 in English and Spanish.
              </p>
              <div className="flex flex-wrap gap-2">
                <a href="tel:988" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm text-sm">
                  <Phone size={16} /> Dial 988
                </a>
                <a href="sms:988" className={`inline-flex items-center gap-2 px-4 py-2 font-bold rounded-xl transition-colors shadow-sm border text-sm ${
                  darkMode ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}>
                  <MessageCircle size={16} /> Text 988
                </a>
              </div>
            </div>
          </div>

          {/* Crisis Text Line */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
            darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'
          }`}>
            <div>
              <h3 className={`font-bold mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Crisis Text Line</h3>
              <p className={`text-sm mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Text HOME to 741741 to connect with a crisis counselor.
              </p>
              <a href="sms:741741" className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-colors shadow-sm ${
                darkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}>
                <MessageCircle size={16} /> Text HOME
              </a>
            </div>
          </div>

          {/* International Resources */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'
          }`}>
            <div>
              <h3 className={`font-bold mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>International Resources</h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Find a helpline in your country.
              </p>
            </div>
            <a href="https://findahelpline.com/" target="_blank" rel="noopener noreferrer" className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-colors shadow-sm ${
              darkMode ? 'bg-slate-800 text-primary-400 hover:bg-slate-700 border border-slate-600' : 'bg-white text-primary-600 hover:bg-slate-100 border border-slate-200'
            }`}>
              <Globe size={16} /> Find a Helpline
            </a>
          </div>

        </div>
        
        {/* Footer */}
        <div className={`p-4 text-center border-t ${darkMode ? 'border-slate-700/50 bg-slate-800/80' : 'border-slate-100 bg-slate-50/80'}`}>
          <p className={`text-xs flex items-center justify-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <Heart size={12} className="text-red-500" /> You matter. Help is just a click away.
          </p>
        </div>
      </div>
    </div>
  );
}
