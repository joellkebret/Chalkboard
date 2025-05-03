import React, { useEffect } from 'react';
import '../Login.css';
import { useNavigate } from 'react-router-dom';

import { UserCircleIcon } from '@heroicons/react/24/outline';

import { supabase } from '../supabase/supabaseClient';

import GoogleIcon from '../assets/google.png';
import GitHubIcon from '../assets/github.png';

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'http://localhost:5173' },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google login failed:', error.message);
      alert(`Google login failed: ${error.message}`);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: 'http://localhost:5173' },
      });
      if (error) throw error;
    } catch (error) {
      console.error('GitHub login failed:', error.message);
      alert(`GitHub login failed: ${error.message}`);
    }
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return;

      // Check if the user has preferences
      const { data: preferences, error: prefError } = await supabase
        .from('preferences')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (prefError || !preferences) {
        navigate('/onboarding'); // First-time user
      } else {
        navigate('/home'); // Existing user
      }
    };

    checkUserStatus();
  }, [navigate]);

  return (
    <section className="container login-section">
      <div className="login-header">
        <UserCircleIcon className="login-logo w-8 h-8" />
        <h1 className="login-title">Chalkboard</h1>
      </div>
      <h2 className="h2 text-s1 mb-8">Log in to your account</h2>
      <div className="login-oauth-group">
        <button className="login-oauth-button" onClick={handleGoogleLogin}>
          <img src={GoogleIcon} alt="Google" className="login-oauth-icon w-6 h-6" />
          Google
        </button>
        <button className="login-oauth-button" onClick={handleGitHubLogin}>
          <img src={GitHubIcon} alt="GitHub" className="login-oauth-icon w-6 h-6" />
          GitHub
        </button>
      </div>
    </section>
  );
};

export default Login;
