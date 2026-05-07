import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { exchangeSocialCode } from '../services/api';

export default function AuthCallback() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();

  const processedRef = React.useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      // 1. Get query params
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state'); // should be 'google' or 'facebook'
      
      if (!code || !state) {
        setError('Missing required authentication parameters. Please try again.');
        return;
      }

      // Prevent double execution in React Strict Mode
      if (processedRef.current) return;
      processedRef.current = true;

      // 2. Call backend to exchange code
      try {
        const redirectUri = `${window.location.origin}/auth/callback`;
        const res = await exchangeSocialCode(state, code, redirectUri);
        
        // 3. Login and redirect
        const { access_token, user } = res.data;
        login(access_token, user);
        navigate('/dashboard', { replace: true });
        
      } catch (err) {
        console.error("OAuth exchange error:", err);
        setError(err.response?.data?.detail || 'Failed to authenticate with social provider. Please try again.');
        
        // Redirect back to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true, state: { error: 'Failed to authenticate with social provider.' } });
        }, 3000);
      }
    };

    processCallback();
  }, [location.search, login, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
      {error ? (
        <div style={{ padding: '20px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', maxWidth: '400px', textAlign: 'center' }}>
          <h3>Authentication Error</h3>
          <p>{error}</p>
          <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>Redirecting to login...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="login-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderTopColor: '#2B39F5', marginBottom: '20px' }}></div>
          <h2 style={{ color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>Completing Sign In...</h2>
          <p style={{ color: '#64748B', marginTop: '8px' }}>Please wait while we securely log you in.</p>
        </div>
      )}
    </div>
  );
}
