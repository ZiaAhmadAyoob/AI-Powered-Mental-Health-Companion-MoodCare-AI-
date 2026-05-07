import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('moodcare-token') || sessionStorage.getItem('moodcare-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

// Auth
export const registerUser = (name, email, password) => api.post('/api/auth/register', { name, email, password });
export const loginUser = (email, password) => api.post('/api/auth/login', { email, password });
export const socialLogin = (data) => api.post('/api/auth/social', data);
export const exchangeSocialCode = (provider, code, redirect_uri) => api.post('/api/auth/social/exchange', { provider, code, redirect_uri });
export const forgotPassword = (email) => api.post('/api/auth/forgot-password', { email });
export const resetPassword = (token, new_password) => api.post('/api/auth/reset-password', { token, new_password });

// Profile
export const getProfile = () => api.get('/api/users/me');
export const updateProfile = (data) => api.put('/api/users/me', data);

// Moods
export const logMood = (mood, stress, note = '') => api.post('/api/moods', { mood_state: mood, stress_level: stress, note });
export const getMoods = (limit = 30) => api.get('/api/moods', { params: { limit } });

// Journals
export const saveJournal = (content) =>
  api.post('/api/journals', { content });
export const getJournals = (limit = 20) =>
  api.get('/api/journals', { params: { limit } });

// Chat
export const sendChatMessage = (message) => api.post('/api/chat', { message });
export const getChatHistory = (limit = 50) => api.get('/api/chat/history', { params: { limit } });

// Insights + Prediction
export const getInsights = () => api.get('/api/insights/summary');
export const getPrediction = () => api.get('/api/insights/predict');

// Dashboard (single call — replaces separate getMoods/getInsights/getPrediction)
export const getDashboardData = () => api.get('/api/insights/dashboard');

// Face Emotion Analysis
export const analyzeFace = (image) => api.post('/api/face/analyze-face', { image });

// Contact/Feedback
export const submitContactForm = (data) => api.post('/api/contact', data);

export default api;