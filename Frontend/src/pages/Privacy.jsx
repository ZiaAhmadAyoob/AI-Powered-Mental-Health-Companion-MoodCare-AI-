import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Privacy() {
  const { darkMode } = useApp();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-800'} p-4 md:p-8 flex justify-center animate-fade-in`}>
      <div className="max-w-4xl w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium ${
              darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-100 text-slate-600 shadow-sm border border-slate-200'
            }`}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="w-10"></div> {/* Spacer for flex balance */}
        </div>

        {/* Content Container */}
        <div className={`rounded-3xl p-8 md:p-12 shadow-xl border ${
          darkMode ? 'bg-slate-800/80 border-slate-700/50 backdrop-blur-xl' : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center gap-4 mb-8 border-b pb-8 border-slate-200 dark:border-slate-700">
            <div className={`p-4 rounded-2xl ${darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-50 text-green-600'}`}>
              <Lock size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Privacy Policy</h1>
              <p className={`mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Last updated: April 2026</p>
            </div>
          </div>

          <div className={`prose prose-lg max-w-none ${darkMode ? 'prose-invert prose-p:text-slate-300 prose-headings:text-slate-100' : 'prose-p:text-slate-600 prose-headings:text-slate-800'}`}>
            <h2>1. Introduction</h2>
            <p>
              At MoodCare AI, your privacy and mental health data security are our highest priorities. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our application.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect via the Application includes:
            </p>
            <ul>
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name and email address, that you voluntarily give to us when you register.</li>
              <li><strong>Health and Emotional Data:</strong> Information regarding your mood, stress levels, journal entries, and chat interactions with the AI companion.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, browser type, and operating system.</li>
            </ul>

            <h2>3. Use of Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:
            </p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Deliver highly personalized AI insights and emotional support.</li>
              <li>Improve the accuracy of our mood prediction and analysis algorithms.</li>
              <li>Send you supportive notifications and reminders.</li>
            </ul>

            <h2>4. Disclosure of Your Information</h2>
            <p>
              We <strong>strictly do not sell</strong> your personal or emotional data. We may share information we have collected about you in certain situations:
            </p>
            <ul>
              <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, or to protect the rights, property, and safety of others (e.g., in case of a severe mental health crisis where imminent danger is detected).</li>
              <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us, such as hosting, data analysis, and email delivery. These third parties are bound by strict confidentiality agreements.</li>
            </ul>

            <h2>5. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. 
              All your journal entries and chat logs are encrypted both in transit and at rest. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>

            <h2>6. Your Data Rights</h2>
            <p>
              You have the right at any time to:
            </p>
            <ul>
              <li>Review or change the information in your account.</li>
              <li>Download a copy of all your emotional and journal data.</li>
              <li>Request the permanent deletion of your account and all associated data.</li>
            </ul>

            <h2>7. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us.
            </p>

            <div className={`mt-12 p-6 rounded-2xl text-center ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
              <button onClick={() => navigate('/contact')} className="text-primary-500 hover:text-primary-600 font-bold underline underline-offset-4">
                Reach out to Data Protection Officer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
