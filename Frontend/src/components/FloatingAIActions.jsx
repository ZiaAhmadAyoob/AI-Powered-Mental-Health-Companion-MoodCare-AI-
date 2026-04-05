import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Wind, MessageSquare, Frown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../translations';

export default function FloatingAIActions({ onOpenBreathing }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { darkMode, language } = useApp();

  const actions = [
    {
      label: t('talkToAI', language),
      icon: MessageSquare,
      onClick: () => { navigate('/chat'); setIsOpen(false); },
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: t('helpMeRelax', language),
      icon: Wind,
      onClick: () => { onOpenBreathing?.(); setIsOpen(false); },
      color: 'from-teal-500 to-emerald-500',
    },
    {
      label: t('iFeelAnxious', language),
      icon: Frown,
      onClick: () => { navigate('/chat'); setIsOpen(false); },
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="fab-container">
      {/* Expanded menu items */}
      <div className={`flex flex-col gap-3 mb-3 items-end transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              onClick={action.onClick}
              className={`fab-menu-item ${isOpen ? 'visible' : ''} flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg border font-semibold text-sm whitespace-nowrap hover-glow ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
              }`}
              style={{ transitionDelay: isOpen ? `${i * 80}ms` : '0ms' }}
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center text-white`}>
                <Icon size={16} />
              </div>
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fab-button bg-gradient-to-r from-primary-500 to-purple-600 text-white ${isOpen ? 'rotate-0' : ''}`}
        aria-label="AI Actions"
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
          {isOpen ? <X size={24} /> : <MessageCircle size={24} className="fill-current" />}
        </div>
      </button>
    </div>
  );
}
