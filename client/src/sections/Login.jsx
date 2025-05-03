import React from 'react';
import '../Login.css'; // Import the separate CSS file for custom styles

const Login = () => {
  const handleLoginClick = () => {
    alert('Login button clicked! Add your authentication logic here.');
  };

  const handleSignUpClick = () => {
    alert('Sign up link clicked! Redirect to sign-up page.');
  };

  return (
    <section className="container login-section">
      <div className="login-header">
        <span className="login-logo">📋</span>
        <h1 className="login-title">Chalkboard</h1>
      </div>
      <h2 className="h2 text-s1 mb-8">Log in to your account</h2>
      <div className="login-input-group">
        <div className="login-input-wrapper">
          <span className="login-icon">📧</span>
          <input type="email" placeholder="Email" className="login-input" />
        </div>
        <div className="login-input-wrapper">
          <span className="login-icon">🔒</span>
          <input type="password" placeholder="Password" className="login-input" />
        </div>
      </div>
      <button className="login-button" onClick={handleLoginClick}>
        Log in
      </button>
      <p className="login-signup-text">
        Don’t have an account?{' '}
        <span className="login-signup-link" onClick={handleSignUpClick}>
          Sign up
        </span>
      </p>
    </section>
  );
};

export default Login;