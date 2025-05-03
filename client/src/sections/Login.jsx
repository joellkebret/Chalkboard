import React from 'react';
import '../Login.css';
import { UserCircleIcon } from '@heroicons/react/24/outline'; // For logo
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../firebase'; // Import Firebase auth and providers
// Import PNG images from src/assets/
import GoogleIcon from '../assets/google.png';
import GitHubIcon from '../assets/github.png';

const Login = () => {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google login successful:', {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
      alert(`Welcome, ${user.displayName}! You are now logged in.`);
    } catch (error) {
      console.error('Google login failed:', error.message);
      alert(`Google login failed: ${error.message}`);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      console.log('GitHub login successful:', {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
      alert(`Welcome, ${user.displayName}! You are now logged in.`);
    } catch (error) {
      console.error('GitHub login failed:', error.message);
      alert(`GitHub login failed: ${error.message}`);
    }
  };

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