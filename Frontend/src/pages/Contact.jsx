import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { submitContactForm } from '../services/api';

export default function Contact() {
  const { darkMode } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const subjects = ['General Inquiry', 'Feedback & Suggestions', 'Bug Report', 'Partnership'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await submitContactForm(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-4">
      <div className="mb-6">
        <h1 className={`text-3xl md:text-4xl font-bold tracking-tight mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
          Contact Us
        </h1>
        <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Contact Information Side */}
        <div className={`col-span-1 rounded-3xl p-6 lg:p-8 flex flex-col justify-between overflow-hidden relative shadow-lg ${
          darkMode ? 'bg-gradient-to-br from-primary-900/60 to-slate-800 border border-slate-700/50' : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
        }`}>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10">
            <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-slate-100' : 'text-white'}`}>Get in touch</h3>
            
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full shrink-0 ${darkMode ? 'bg-slate-800 text-primary-400' : 'bg-white/20 text-white'}`}>
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-white/80'}`}>Email</p>
                  <p className={`font-semibold text-sm break-all ${darkMode ? 'text-slate-200' : 'text-white'}`}>moodcareai@gmail.com</p>
                </div>
              </div>
            
            
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full shrink-0 ${darkMode ? 'bg-slate-800 text-primary-400' : 'bg-white/20 text-white'}`}>
                  <MessageSquare size={18} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-white/80'}`}>Live Chat</p>
                  <p className={`font-semibold text-sm ${darkMode ? 'text-slate-200' : 'text-white'}`}>Available 9 AM - 5 PM PKT</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-white/20">
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-white/80'}`}>
              If you are in a crisis or experiencing a mental health emergency, please use our Crisis Support feature immediately.
            </p>
          </div>
        </div>

        {/* Contact Form Side */}
        <div className={`col-span-2 rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl border ${
          darkMode ? 'bg-slate-800/80 border-slate-700/50 backdrop-blur-xl' : 'bg-white border-slate-100'
        }`}>
          {success ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in py-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Message Sent!</h3>
              <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                Thank you for reaching out. We have received your message and will get back to you shortly.
              </p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-8 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
              
              {error && (
                <div className="p-3 lg:p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3">
                  <AlertCircle className="shrink-0 mt-0.5" size={18} />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Your Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                      darkMode ? 'bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                      darkMode ? 'bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer ${
                    darkMode ? 'bg-slate-900/50 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {subjects.map(sub => (
                    <option key={sub} value={sub} className={darkMode ? 'bg-slate-800' : ''}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Message</label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none ${
                    darkMode ? 'bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-medium rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
