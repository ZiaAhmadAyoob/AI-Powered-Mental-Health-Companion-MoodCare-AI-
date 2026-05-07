import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Smile,
  BookHeart,
  BarChart2,
  Settings,
  User,
  Mail,
  AlertOctagon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../translations';

const linkKeys = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'aiChat', path: '/chat', icon: MessageSquare },
  { key: 'moodTracker', path: '/mood-tracker', icon: Smile },
  { key: 'journal', path: '/journal', icon: BookHeart },
  { key: 'insights', path: '/insights', icon: BarChart2 },
  { key: 'viewProfile', path: '/profile', icon: User, defaultText: 'Profile' },
  { key: 'settings', path: '/settings', icon: Settings },
  { key: 'contact', path: '/contact', icon: Mail, defaultText: 'Contact Us' },
];

export default function Sidebar({ onOpenCrisisModal }) {
  const { darkMode, language, isSidebarOpen, setIsSidebarOpen } = useApp();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72 md:w-64 backdrop-blur-2xl border-r flex flex-col h-full px-4 py-8 md:py-6 overflow-x-hidden
      transition-transform duration-300 ease-in-out md:relative md:translate-x-0
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      ${darkMode
        ? 'bg-slate-800/95 md:bg-slate-800/60 border-slate-700/50 shadow-[4px_0_24px_rgba(0,0,0,0.5)] md:shadow-[4px_0_24px_rgba(0,0,0,0.1)]'
        : 'bg-white/95 md:bg-white/60 border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.1)] md:shadow-[4px_0_24px_rgba(0,0,0,0.02)]'
      }
    `}>
      <div className="flex items-center gap-3 px-2 mb-10 text-primary-600">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl text-white shadow-md shadow-primary-500/30">
          <Smile size={24} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">MoodCare<span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>AI</span></h1>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-2">
        {linkKeys.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsSidebarOpen(false)} // Close on mobile navigation
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 md:py-2 rounded-2xl transition-all font-bold text-sm md:text-base ${isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20 md:translate-x-1'
                  : darkMode
                    ? 'text-slate-400 hover:bg-slate-700/80 hover:text-primary-400 hover:shadow-sm'
                    : 'text-slate-500 hover:bg-primary-50 hover:text-primary-600 hover:shadow-sm'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {t(link.key, language) || link.defaultText}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto mb-4 md:mb-6">
        <div className={`p-4 rounded-2xl ${darkMode ? 'bg-red-900/20 border border-red-900/30' : 'bg-red-50 border border-red-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon size={18} className="text-red-500" />
            <h3 className={`font-bold text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Crisis Support</h3>
          </div>
          <p className={`text-xs mb-3 ${darkMode ? 'text-red-200/70' : 'text-red-600/80'}`}>Immediate help available 24/7</p>
          <button
            onClick={onOpenCrisisModal}
            className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-red-500/20"
          >
            Get Help Now
          </button>
        </div>
      </div>

      <div className={`mb-6 md:mb-0 border-t pt-4 text-center ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
        <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          MoodCare AI v2.0
        </p>
        <div className="flex justify-center gap-3 text-[10px]">
          <NavLink to="/terms" className={`hover:underline ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>Terms</NavLink>
          <span className={darkMode ? 'text-slate-600' : 'text-slate-300'}>&bull;</span>
          <NavLink to="/privacy" className={`hover:underline ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>Privacy</NavLink>
        </div>
      </div>
    </aside>
  );
}
