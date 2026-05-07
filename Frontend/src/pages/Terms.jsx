import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Terms() {
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
            <div className={`p-4 rounded-2xl ${darkMode ? 'bg-primary-900/50 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Terms of Service</h1>
              <p className={`mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Last updated: April 2026</p>
            </div>
          </div>

          <div className={`prose prose-lg max-w-none ${darkMode ? 'prose-invert prose-p:text-slate-300 prose-headings:text-slate-100' : 'prose-p:text-slate-600 prose-headings:text-slate-800'}`}>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using MoodCare AI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
              In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              MoodCare AI provides users with mental health tracking, journaling, and AI-driven insights. 
              <strong> The Service is not a substitute for professional medical advice, diagnosis, or treatment. </strong>
              Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>

            <h2>3. User Account and Security</h2>
            <p>
              To use certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account and password.
              You agree to accept responsibility for all activities that occur under your account or password.
            </p>

            <h2>4. Privacy and Data Security</h2>
            <p>
              Your privacy is extremely important to us. Our use of your personal information is governed by our Privacy Policy.
              By using the Service, you consent to the data practices described in the Privacy Policy. We employ industry-standard encryption to protect your journal entries and emotional data.
            </p>

            <h2>5. User Conduct</h2>
            <p>
              You agree not to use the Service to:
            </p>
            <ul>
              <li>Upload, post, or transmit any content that is unlawful, harmful, threatening, or abusive.</li>
              <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its related systems or networks.</li>
            </ul>

            <h2>6. Intellectual Property</h2>
            <p>
              All content included on the Service, such as text, graphics, logos, button icons, images, and software, is the property of MoodCare AI or its content suppliers and protected by international copyright laws.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              MoodCare AI shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or the inability to use the Service, including but not limited to damages for loss of profits, use, data, or other intangibles.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this site.
            </p>

            <div className={`mt-12 p-6 rounded-2xl text-center ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
              <p className="font-medium mb-2">Questions about these Terms?</p>
              <button onClick={() => navigate('/contact')} className="text-primary-500 hover:text-primary-600 font-bold underline underline-offset-4">
                Contact our support team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
