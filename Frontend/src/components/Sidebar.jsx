import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Smile, 
  BookHeart, 
  BarChart2, 
  Settings,
  User 
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
];

export default function Sidebar() {
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
      
      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {linkKeys.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsSidebarOpen(false)} // Close on mobile navigation
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm md:text-base ${
                  isActive 
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
      
      <div className={`mt-auto mb-6 md:mb-0 border-t pt-6 text-center ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
        <p className={`text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          MoodCare AI v2.0
        </p>
      </div>
    </aside>
  );
}
