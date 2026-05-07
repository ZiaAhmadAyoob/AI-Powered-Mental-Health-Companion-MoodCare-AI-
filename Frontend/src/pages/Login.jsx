import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { registerUser, loginUser, socialLogin, forgotPassword, resetPassword } from '../services/api';
import './Login.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'reset' | 'resetDone'
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const { login, isAuthenticated } = useApp();

  /* ── Redirect if authenticated ─────────────────────────────────── */
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  /* ── Email / password submit ───────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formEmail || !formPassword) return;
    if (!isLogin && !formName) return;

    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await loginUser(formEmail, formPassword);
      } else {
        res = await registerUser(formName, formEmail, formPassword);
      }
      const { access_token, user } = res.data;
      setLoading(false);
      setSuccess(true);
      setTimeout(() => login(access_token, user, remember), 1200);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.detail || 'Something went wrong. Please try again.';
      setError(msg);
    }
  };

  /* ── Real OAuth login redirect ──────────────────────────────────── */
  const handleSocialLogin = (provider) => {
    setError('');
    setSocialLoading(provider);

    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    
    if (provider === 'google') {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setError('Google Client ID is missing. Please check your .env file.');
        setSocialLoading('');
        return;
      }
      const scope = encodeURIComponent('email profile');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=google`;
      window.location.href = authUrl;
    } else if (provider === 'facebook') {
      const appId = import.meta.env.VITE_FACEBOOK_CLIENT_ID || import.meta.env.VITE_FACEBOOK_APP_ID;
      if (!appId) {
        setError('Facebook App/Client ID is missing. Please check your .env file.');
        setSocialLoading('');
        return;
      }
      const scope = encodeURIComponent('email,public_profile');
      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=facebook`;
      window.location.href = authUrl;
    }
  };

  /* ── Forgot password ───────────────────────────────────────────── */
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMsg('');
    if (!resetEmail) return;
    setForgotLoading(true);
    try {
      const res = await forgotPassword(resetEmail);
      setForgotMsg(res.data.message);
      setView('reset');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMsg('');
    if (!resetCode || !newPassword) return;
    setForgotLoading(true);
    try {
      const res = await resetPassword(resetCode, newPassword);
      setForgotMsg(res.data.message);
      setView('resetDone');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired code.');
    } finally {
      setForgotLoading(false);
    }
  };

  /* ── Button state class ────────────────────────────────────────── */
  const btnClass = `login-btn-primary${loading ? ' loading' : ''}${success ? ' success' : ''}`;

  /* ── Button content ────────────────────────────────────────────── */
  const renderBtnContent = () => {
    if (success) {
      return (
        <span className="login-btn-primary-inner">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10l4.5 4.5L16 6"/>
          </svg>
          Welcome back! ✦
        </span>
      );
    }
    if (loading) {
      return (
        <span className="login-btn-primary-inner">
          <div className="login-spinner"></div>
          {isLogin ? 'Signing in…' : 'Creating account…'}
        </span>
      );
    }
    return (
      <span className="login-btn-primary-inner">
        {isLogin ? 'Enter Your Space' : 'Create Account'}
        <span className="login-btn-arrow">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10h12M11 5l5 5-5 5"/>
          </svg>
        </span>
      </span>
    );
  };

  return (
    <div className="login-page">
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Manrope:wght@300;400;500;600&display=swap" rel="stylesheet"/>

      <div className="login-shell">

        {/* ════ LEFT PANEL ════ */}
        <div className="login-left">
          <div className="login-shape login-s1"></div>
          <div className="login-shape login-s2"></div>
          <div className="login-shape login-s3"></div>
          <div className="login-shape login-s4"></div>
          <div className="login-shape login-s5"></div>

          <div className="login-left-top">
            <div className="login-brand">
              <div className="login-brand-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.81 3.82 12 4C12.19 3.82 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z" fill="white" fillOpacity="0.95"/>
                  <circle cx="9" cy="8" r="1.2" fill="rgba(99,102,241,0.8)"/>
                  <circle cx="15" cy="8" r="1.2" fill="rgba(99,102,241,0.8)"/>
                  <path d="M8 11 Q12 14 16 11" stroke="rgba(99,102,241,0.8)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <span className="login-brand-name">Moodcare AI</span>
            </div>

            <div className="login-badge" style={{display:'inline-flex'}}>
              <span className="login-badge-dot"></span>
              Multi-Agent AI · Always On
            </div>

            <h1 className="login-left-heading">
              AI that truly<br/>
              <span>understands</span><br/>
              you.
            </h1>
            <p className="login-left-sub">
              A fully AI-powered mental health companion — every response, insight, and recommendation personalized to you, in real time.
            </p>
            <div className="login-tagline-pill">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
                <path d="M10 18C10 18 2 12.5 2 7a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 5.5-8 11-8 11z"/>
              </svg>
              <span>Feel Heard. Heal Forward.</span>
            </div>
          </div>

          <div className="login-left-card">
            <div className="login-left-card-label">Wellness at a Glance</div>
            <div className="login-left-card-stats">
              <div className="login-stat">
                <div className="login-stat-num">50k+</div>
                <div className="login-stat-label">Minds Helped</div>
              </div>
              <div className="login-stat">
                <div className="login-stat-num">4.9★</div>
                <div className="login-stat-label">User Rating</div>
              </div>
              <div className="login-stat">
                <div className="login-stat-num">24/7</div>
                <div className="login-stat-label">AI Support</div>
              </div>
            </div>
            <div className="login-avatars">
              <div className="login-av" style={{background:'#34D399'}}>SA</div>
              <div className="login-av" style={{background:'#818CF8'}}>MK</div>
              <div className="login-av" style={{background:'#F472B6'}}>RI</div>
              <div className="login-av" style={{background:'#60A5FA'}}>TN</div>
              <div className="login-av login-av-more">+1k</div>
              <span className="login-av-text">felt better this week</span>
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div className="login-right">
          <div className="login-form-box">

            {/* Error */}
            {error && (
              <div className="login-error">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
                  <circle cx="10" cy="10" r="8"/>
                  <path d="M10 6v5M10 13.5v.5"/>
                </svg>
                {error}
              </div>
            )}

            {/* Success message */}
            {forgotMsg && (
              <div className="login-error" style={{background:'#F0FDF4', borderColor:'#BBF7D0', color:'#16A34A'}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round">
                  <circle cx="10" cy="10" r="8"/>
                  <path d="M7 10l2 2 4-4"/>
                </svg>
                {forgotMsg}
              </div>
            )}

            {/* ═══ VIEW: LOGIN / SIGNUP ═══ */}
            {(view === 'login') && (<>
              <h2 className="login-form-title">
                {isLogin ? 'Welcome back 👋' : 'Create account ✨'}
              </h2>
              <p className="login-form-sub">
                {isLogin ? 'Your mental wellness journey continues here.' : 'Start your mental wellness journey today.'}
              </p>

              {/* Social buttons */}
              <div className="login-socials">
                <button className="login-btn-social login-btn-google" type="button" disabled={!!socialLoading || loading} onClick={() => handleSocialLogin('google')}>
                  {socialLoading === 'google' ? (
                    <div className="login-spinner" style={{borderColor:'#D8DBEC', borderTopColor:'#2B39F5', width:16, height:16}}></div>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.4 30.2 0 24 0 14.7 0 6.7 5.4 2.8 13.3l7.8 6.1C12.4 13.1 17.8 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.7 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.8c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7.2-10.2 7.2-17.1z"/>
                      <path fill="#FBBC05" d="M10.6 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.7-4.6l-7.8-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l8-6.1z"/>
                      <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.6-5.9c-2 1.4-4.6 2.2-7.6 2.2-6.2 0-11.4-3.7-13.4-9l-8 6.1C6.8 42.7 14.7 48 24 48z"/>
                    </svg>
                  )}
                  Sign in with Google
                </button>
                <button className="login-btn-social login-btn-facebook" type="button" disabled={!!socialLoading || loading} onClick={() => handleSocialLogin('facebook')}>
                  {socialLoading === 'facebook' ? (
                    <div className="login-spinner" style={{width:16, height:16}}></div>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="white" d="M48 24C48 10.7 37.3 0 24 0S0 10.7 0 24c0 12 8.8 21.9 20.3 23.7V30.9h-6.1V24h6.1v-5.3c0-6 3.6-9.3 9-9.3 2.6 0 5.3.5 5.3.5v5.9h-3c-2.9 0-3.8 1.8-3.8 3.7V24h6.5l-1 6.9h-5.5v16.8C39.2 45.9 48 36 48 24z"/>
                    </svg>
                  )}
                  Sign in with Facebook
                </button>
              </div>

              <div className="login-divider"><span className="login-divider-text">or use email</span></div>

              <form onSubmit={handleSubmit}>
                <div className={`login-name-field ${isLogin ? 'hidden' : 'visible'}`}>
                  <label className="login-field-label" htmlFor="login-name">Full Name</label>
                  <div className="login-input-wrap">
                    <input type="text" id="login-name" placeholder="John Doe" value={formName} onChange={(e) => setFormName(e.target.value)} autoComplete="name"/>
                    <span className="login-input-icon">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="10" cy="7" r="4"/><path d="M3 18c0-3.3 3.1-6 7-6s7 2.7 7 6"/></svg>
                    </span>
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-field-label" htmlFor="login-email">Email Address</label>
                  <div className="login-input-wrap">
                    <input type="email" id="login-email" placeholder="you@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} autoComplete="email" required/>
                    <span className="login-input-icon">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="16" height="12" rx="2.5"/><path d="M2 7l8 5 8-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-field-label" htmlFor="login-password">Password</label>
                  <div className="login-input-wrap">
                    <input type={showPassword ? 'text' : 'password'} id="login-password" placeholder="••••••••••" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} autoComplete={isLogin ? 'current-password' : 'new-password'} required/>
                    <button type="button" className="login-input-icon" onClick={() => setShowPassword(!showPassword)} title={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l14 14"/><path d="M10.5 5.2A8 5.5 0 0 1 18 10M1.8 10A8 5.5 0 0 0 9 14.7"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><ellipse cx="10" cy="10" rx="8" ry="5.5"/><circle cx="10" cy="10" r="2.2"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="login-field-row">
                    <label className="login-check-wrap">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}/>
                      <span className="login-check-label">Remember me</span>
                    </label>
                    <button type="button" className="login-forgot" onClick={() => { setView('forgot'); setError(''); setForgotMsg(''); setResetEmail(formEmail); }}>Forgot password?</button>
                  </div>
                )}

                <button className={btnClass} type="submit" disabled={loading || success}>{renderBtnContent()}</button>
              </form>

              <div className="login-signup-row">
                {isLogin ? 'New here?\u00A0' : 'Already have an account?\u00A0'}
                <button type="button" className="login-signup-link" onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(false); }}>
                  {isLogin ? 'Start your free journey' : 'Sign in'}
                </button>
              </div>
              <div className="login-terms">By signing in, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></div>
            </>)}

            {/* ═══ VIEW: FORGOT PASSWORD ═══ */}
            {view === 'forgot' && (<>
              <h2 className="login-form-title">Forgot password? 🔑</h2>
              <p className="login-form-sub">Enter your email and we'll send you a reset code.</p>
              <form onSubmit={handleForgotPassword}>
                <div className="login-field">
                  <label className="login-field-label" htmlFor="reset-email">Email Address</label>
                  <div className="login-input-wrap">
                    <input type="email" id="reset-email" placeholder="you@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required/>
                    <span className="login-input-icon">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="16" height="12" rx="2.5"/><path d="M2 7l8 5 8-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  </div>
                </div>
                <button className={`login-btn-primary${forgotLoading ? ' loading' : ''}`} type="submit" disabled={forgotLoading}>
                  <span className="login-btn-primary-inner">
                    {forgotLoading ? <><div className="login-spinner"></div> Sending…</> : 'Send Reset Code'}
                  </span>
                </button>
              </form>
              <div className="login-signup-row">
                <button type="button" className="login-signup-link" onClick={() => { setView('login'); setError(''); setForgotMsg(''); }}>← Back to Sign In</button>
              </div>
            </>)}

            {/* ═══ VIEW: ENTER RESET CODE ═══ */}
            {view === 'reset' && (<>
              <h2 className="login-form-title">Enter reset code 🔢</h2>
              <p className="login-form-sub">Check your email (or backend console) for the 6-digit code.</p>
              <form onSubmit={handleResetPassword}>
                <div className="login-field">
                  <label className="login-field-label" htmlFor="reset-code">Reset Code</label>
                  <div className="login-input-wrap">
                    <input type="text" id="reset-code" placeholder="000000" value={resetCode} onChange={(e) => setResetCode(e.target.value)} maxLength={6} style={{letterSpacing:'0.3em', fontWeight:700, fontSize:18, textAlign:'center'}} required/>
                  </div>
                </div>
                <div className="login-field">
                  <label className="login-field-label" htmlFor="new-password">New Password</label>
                  <div className="login-input-wrap">
                    <input type="password" id="new-password" placeholder="••••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" required/>
                  </div>
                </div>
                <button className={`login-btn-primary${forgotLoading ? ' loading' : ''}`} type="submit" disabled={forgotLoading}>
                  <span className="login-btn-primary-inner">
                    {forgotLoading ? <><div className="login-spinner"></div> Resetting…</> : 'Reset Password'}
                  </span>
                </button>
              </form>
              <div className="login-signup-row">
                <button type="button" className="login-signup-link" onClick={() => { setView('forgot'); setError(''); setForgotMsg(''); }}>← Back</button>
              </div>
            </>)}

            {/* ═══ VIEW: RESET SUCCESS ═══ */}
            {view === 'resetDone' && (<>
              <h2 className="login-form-title">Password reset! ✅</h2>
              <p className="login-form-sub">Your password has been updated. You can now sign in with your new password.</p>
              <button className="login-btn-primary" type="button" onClick={() => { setView('login'); setError(''); setForgotMsg(''); setSuccess(false); }}>
                <span className="login-btn-primary-inner">
                  Back to Sign In
                  <span className="login-btn-arrow">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M11 5l5 5-5 5"/></svg>
                  </span>
                </span>
              </button>
            </>)}

          </div>
        </div>
      </div>
    </div>
  );
}
