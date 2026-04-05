import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, User, Settings as SettingsIcon, Shield, Upload, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../translations';
import { updateProfile as updateProfileApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Ccircle cx='64' cy='64' r='64' fill='%23e2e8f0'/%3E%3Ccircle cx='64' cy='50' r='22' fill='%2394a3b8'/%3E%3Cellipse cx='64' cy='106' rx='38' ry='28' fill='%2394a3b8'/%3E%3C/svg%3E";

export default function Profile() {
  const { darkMode, language, userProfile, setUserProfile, logout } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(userProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(userProfile.avatar || DEFAULT_AVATAR);
  const fileInputRef = useRef(null);

  // Sync form data when userProfile updates (e.g. after async fetch on login)
  useEffect(() => {
    setFormData(userProfile);
    setPreviewAvatar(userProfile.avatar || DEFAULT_AVATAR);
  }, [userProfile]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewAvatar(base64);
        setFormData(prev => ({ ...prev, avatar: base64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Update backend
      await updateProfileApi({
        name: formData.name,
        phone: formData.phone,
        preferred_tone: formData.preferredTone,
        reminder_time: formData.reminderTime,
        anonymous_mode: formData.anonymousMode,
        avatar_url: formData.avatar,
      });

      // Update local context
      setUserProfile(prev => ({ ...prev, ...formData }));
    } catch {
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const inputClass = `w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all font-medium ${
    darkMode 
      ? 'bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500' 
      : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
  }`;

  const labelClass = `block text-sm font-bold mb-2 ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className={`space-y-6 animate-fade-in pb-10 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('profileTitle', language) || 'Profile'}</h1>
          <p className={`mt-1 text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('profileSubtitle', language) || 'Manage your personal details and app preferences.'}</p>
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
            darkMode 
              ? 'text-red-400 border-red-800/50 hover:bg-red-900/30' 
              : 'text-red-500 border-red-200 hover:bg-red-50'
          }`}
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      <form onSubmit={handleSubmit} className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        
        <div className="lg:col-span-1 space-y-6">
          <div className={`p-6 rounded-3xl shadow-sm border flex flex-col items-center justify-center text-center hover-glow animate-slide-up ${
            darkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-slate-100'
          }`}>
            <div className="relative group mb-4">
              <div className={`w-32 h-32 rounded-full border-4 shadow-lg overflow-hidden mx-auto transition-transform group-hover:scale-105 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-white bg-slate-100'}`}>
                <img src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 w-32 h-32 mx-auto rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all cursor-pointer"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center text-white">
                  <Upload size={24} />
                  <span className="text-xs font-bold mt-1">Upload</span>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-md hover:scale-110"
                title="Upload profile picture"
              >
                <Camera size={20} />
              </button>

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold">{formData.name || 'User'}</h2>
            <p className={`font-medium text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{formData.email}</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {t('clickToUpload', language) || 'Click avatar to upload photo'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          
          <div className={`p-6 md:p-8 rounded-3xl shadow-sm border animate-slide-up delay-75 ${
            darkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center gap-2 mb-6 text-primary-500">
              <User size={24} />
              <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('basicInfo', language) || 'Basic Information'}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>{t('fullName', language) || 'Full Name'}</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="John Doe" required />
              </div>
              <div>
                <label className={labelClass}>{t('email', language) || 'Email'}</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="john@example.com" disabled />
              </div>
              <div>
                <label className={labelClass}>{t('phone', language) || 'Phone (Optional)'}</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+1 234 567 890" />
              </div>
            </div>
          </div>

          <div className={`p-6 md:p-8 rounded-3xl shadow-sm border animate-slide-up delay-150 ${
            darkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center gap-2 mb-6 text-purple-500">
              <SettingsIcon size={24} />
              <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('mentalHealthPref', language) || 'Mental Health Preferences'}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>{t('preferredTone', language) || 'AI Preferred Tone'}</label>
                <select name="preferredTone" value={formData.preferredTone} onChange={handleChange} className={inputClass}>
                  <option value="friendly">{t('friendly', language) || 'Friendly & Casual'}</option>
                  <option value="professional">{t('professional', language) || 'Professional & Clinical'}</option>
                  <option value="motivational">{t('motivational', language) || 'Motivational & Cheerful'}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('reminderTime', language) || 'Daily Reminder Time'}</label>
                <input type="time" name="reminderTime" value={formData.reminderTime} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          <div className={`p-6 md:p-8 rounded-3xl shadow-sm border animate-slide-up delay-200 ${
            darkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center gap-2 mb-6 text-accent-teal">
              <Shield size={24} />
              <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('privacySettings', language) || 'Privacy Settings'}</h3>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <p className="font-bold">{t('anonymousMode', language) || 'Anonymous Mode'}</p>
                <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('anonymousModeDesc', language) || 'Hide your identity from AI interactions.'}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, anonymousMode: !formData.anonymousMode})}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent-teal/50 shrink-0 ${
                  formData.anonymousMode ? 'bg-accent-teal' : (darkMode ? 'bg-slate-600' : 'bg-slate-300')
                }`}
                role="switch"
                aria-checked={formData.anonymousMode}
              >
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  formData.anonymousMode ? 'translate-x-7' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={isSaving}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all shadow-lg hover:-translate-y-1 hover-glow ${
                isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 hover:shadow-primary-500/30'
              }`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={20} />
              )}
              {isSaving ? 'Saving...' : (t('saveChanges', language) || 'Save Changes')}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
