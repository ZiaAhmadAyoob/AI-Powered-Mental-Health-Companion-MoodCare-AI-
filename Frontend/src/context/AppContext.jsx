// src/context/AppContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../services/api";

const AppContext = createContext();

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Ccircle cx='64' cy='64' r='64' fill='%23e2e8f0'/%3E%3Ccircle cx='64' cy='50' r='22' fill='%2394a3b8'/%3E%3Cellipse cx='64' cy='106' rx='38' ry='28' fill='%2394a3b8'/%3E%3C/svg%3E";

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("moodcare-dark") === "true");
  const [language, setLanguage] = useState(() => localStorage.getItem("moodcare-lang") || "en");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Auth state (check both storages for "Remember me" support) ───
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!(localStorage.getItem("moodcare-token") || sessionStorage.getItem("moodcare-token"))
  );

  // ── User profile ──────────────────────────────────────────────────
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: DEFAULT_AVATAR,
    preferredTone: "friendly",
    reminderTime: "09:00",
    anonymousMode: false,
  });

  // ── AI state — this is what makes dashboard feel alive ────────────
  const [currentMood, setCurrentMood] = useState("calm");
  const [stressLevel, setStressLevel] = useState(30);
  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const [crisisLevel, setCrisisLevel] = useState("none");
  const [streakDays, setStreakDays] = useState(0);

  // ── AI generated content ──────────────────────────────────────────
  const [aiInsights, setAiInsights] = useState([]);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState("");

  // ── Fetch real profile from backend on login ──────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      getProfile()
        .then(res => {
          const u = res.data;
          setUserProfile(prev => ({
            ...prev,
            name: u.name || prev.name,
            email: u.email || prev.email,
            preferredTone: u.preferred_tone || prev.preferredTone,
            reminderTime: u.reminder_time || prev.reminderTime,
            anonymousMode: u.anonymous_mode || prev.anonymousMode,
            avatar: u.avatar_url || prev.avatar,
          }));
        })
        .catch(() => { });
    }
  }, [isAuthenticated]);

  // ── Persist dark mode ─────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("moodcare-dark", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // ── Persist language ──────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("moodcare-lang", language);
  }, [language]);

  // ── Sync mood to html data-mood attribute (for CSS blobs) ─────────
  useEffect(() => {
    document.documentElement.setAttribute("data-mood", currentMood);
  }, [currentMood]);

  const login = (token, user, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem("moodcare-token", token);
    } else {
      sessionStorage.setItem("moodcare-token", token);
    }
    setIsAuthenticated(true);
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        avatar: user.avatar_url || prev.avatar,
      }));
    }
  };

  const logout = () => {
    localStorage.removeItem("moodcare-token");
    sessionStorage.removeItem("moodcare-token");
    setIsAuthenticated(false);
    setUserProfile({
      name: "", email: "", phone: "",
      avatar: DEFAULT_AVATAR,
      preferredTone: "friendly",
      reminderTime: "09:00",
      anonymousMode: false,
    });
    setCurrentMood("calm");
    setStressLevel(30);
  };

  const toggleDarkMode = () => setDarkMode(d => !d);

  const updateProfile = (key, value) => {
    setUserProfile(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AppContext.Provider value={{
      // ui
      darkMode, toggleDarkMode,
      language, setLanguage,
      isSidebarOpen, setIsSidebarOpen,
      // auth
      isAuthenticated, login, logout,
      // profile
      userProfile, setUserProfile, updateProfile,
      // ai state
      currentMood, setCurrentMood,
      stressLevel, setStressLevel,
      currentEmotion, setCurrentEmotion,
      crisisLevel, setCrisisLevel,
      streakDays, setStreakDays,
      // ai generated content
      aiInsights, setAiInsights,
      aiPrediction, setAiPrediction,
      weeklySummary, setWeeklySummary,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);