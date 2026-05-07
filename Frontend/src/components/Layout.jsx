import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, User, Settings, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import FloatingAIActions from './FloatingAIActions';
import BreathingExercise from './BreathingExercise';
import { useApp } from '../context/AppContext';
import CrisisModal from './CrisisModal';
import { t } from '../translations';

export default function Layout() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const { darkMode, language, currentMood, userProfile, isSidebarOpen, setIsSidebarOpen, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Reset scroll on tab change to prevent Chrome's off-screen header bug
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    window.scrollTo(0, 0); // Failsafe for mobile viewports
  }, [location.pathname]);

  // Mood-reactive emoji for header
  const moodEmoji = {
    happy: '😊', calm: '😌', sad: '😢', stressed: '😰', anxious: '😟',
  };

  const closeMenus = () => {
    setShowNotifications(false);
    setShowProfileMenu(false);
  };

  return (
    <div className={`flex h-screen relative overflow-hidden transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-900 text-slate-200' 
        : 'bg-[#f8fafc] text-slate-800'
    }`} onClick={() => closeMenus()}>
      
      {/* Mood-reactive animated background blobs */}
      <div className={`mood-blob-1 absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full mix-blend-multiply filter blur-[120px] animate-breathe pointer-events-none ${
        darkMode ? 'bg-primary-500/10 opacity-50' : 'bg-primary-300/20 opacity-70'
      }`}></div>
      <div className={`mood-blob-2 absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none ${
        darkMode ? 'bg-purple-500/10 opacity-40' : 'bg-purple-300/20 opacity-70'
      }`} style={{ animationDelay: '3s' }}></div>
      <div className={`mood-blob-3 absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none ${
        darkMode ? 'bg-accent-teal/5 opacity-30' : 'bg-accent-teal/10 opacity-50'
      }`}></div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Hybrid Sidebar */}
      <Sidebar onOpenCrisisModal={() => setIsCrisisModalOpen(true)} />

      <main ref={mainRef} className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full min-w-0">
        
        {/* Responsive Header */}
        <header className={`h-16 md:h-20 flex-shrink-0 backdrop-blur-2xl border-b px-4 md:px-8 flex items-center justify-between relative z-30 transition-colors duration-300 ${
          darkMode 
            ? 'bg-slate-800/80 border-slate-700/40 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' 
            : 'bg-white/80 border-slate-200 shadow-[0_4px_30px_rgba(0,0,0,0.02)]'
        }`}>
          
          {/* Left Side: Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(true); }}
              className={`md:hidden p-2 -ml-2 rounded-xl transition-colors ${
                darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Menu size={24} />
            </button>
            
            {/* Mobile Title (hidden on desktop where sidebar shows it) */}
            <h1 className={`md:hidden text-lg font-bold tracking-tight bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent`}>
              MoodCare
            </h1>
          </div>

          {/* Center: Mood Indicator (Hidden on very small screens) */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-500 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 ${
            darkMode 
              ? 'bg-slate-700/60 border-slate-600 text-slate-300' 
              : 'bg-white/60 border-slate-200 text-slate-600'
          }`}>
            <span className="text-base">{moodEmoji[currentMood] || '😌'}</span>
            <span className="capitalize">{t(currentMood, language)}</span>
          </div>

          {/* Right Side: Actions & Profile */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                className={`p-2 rounded-full transition-colors relative hover-glow ${
                  darkMode 
                    ? 'text-slate-400 hover:bg-slate-700' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Bell size={22} className="md:w-6 md:h-6" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
              </button>
              
              {showNotifications && (
                <div 
                  className={`absolute top-12 right-0 w-72 md:w-80 rounded-2xl shadow-xl border p-4 z-50 animate-scale-in origin-top-right ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className={`font-bold mb-3 px-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{t('notificationsTitle', language)}</h3>
                  <div className="space-y-2">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-primary-900/30' : 'bg-primary-50'}`}>
                      <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{t('logMoodNotification', language)}</p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('twoHoursAgo', language)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full border-2 shadow-sm overflow-hidden transition-transform hover:scale-105 active:scale-95 ${
                  showProfileMenu ? 'ring-2 ring-primary-500 border-transparent' : (darkMode ? 'border-slate-600' : 'border-white')
                }`}
              >
                <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover bg-slate-100" />
              </button>

              {showProfileMenu && (
                <div 
                  className={`absolute top-12 right-0 w-56 rounded-2xl shadow-xl border py-2 z-50 animate-scale-in origin-top-right ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 mb-1">
                    <p className={`font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{userProfile.name}</p>
                    <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{userProfile.email}</p>
                  </div>
                  
                  <button onClick={() => { navigate('/profile'); closeMenus(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <User size={16} /> {t('viewProfile', language) || 'View Profile'}
                  </button>
                  <button onClick={() => { navigate('/settings'); closeMenus(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Settings size={16} /> {t('settings', language)}
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700/50"></div>
                  <button onClick={() => { logout(); navigate('/login'); closeMenus(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${darkMode ? 'text-red-400 hover:bg-slate-700/50' : 'text-red-500 hover:bg-red-50'}`}>
                    <LogOut size={16} /> {t('logout', language)}
                  </button>
                </div>
              )}
            </div>
            
          </div>
        </header>

        {/* Main Content Area */}
        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto h-full pb-20 md:pb-8">
              <Outlet />
          </div>
        </div>
      </main>

      {/* Floating AI Actions */}
      <FloatingAIActions onOpenBreathing={() => setIsBreathingOpen(true)} />
      <BreathingExercise isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)} />
      <CrisisModal isOpen={isCrisisModalOpen} onClose={() => setIsCrisisModalOpen(false)} />
    </div>
  );
}
