import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabase/supabaseClient';
import { motion } from 'framer-motion';
import GoogleIcon from '../assets/google.png';
import GitHubIcon from '../assets/github.png';

const Login = () => {
  const navigate = useNavigate();

  const handleOAuthLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/onboarding'
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error(`${provider} login failed:`, error.message);
      alert(`${provider} login failed: ${error.message}`);
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return;

      if (user) {
        const redirect = localStorage.getItem('redirectAfterLogin');
        if (redirect) {
          localStorage.removeItem('redirectAfterLogin');
          navigate('/filter');
        } else {
          navigate('/onboarding');
        }
      }
    };

    checkLogin();
  }, []);

  return (
    <section className="h-[calc(100vh-64px)] flex items-center justify-center bg-[#292f36] px-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm py-16 px-8 z-10 text-center space-y-8"
      >
        <div className="flex flex-col items-center space-y-2">
          <UserCircleIcon className="w-12 h-12 text-[#292f36]" />
          <h1 className="text-3xl font-extrabold text-[#292f36] font-fredericka">Chalkboard</h1>
        </div>
        <p className="text-gray-600 text-sm">Log in to your account</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="flex items-center justify-center gap-3 bg-white border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium"
          >
            <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => handleOAuthLogin('github')}
            className="flex items-center justify-center gap-3 bg-black px-4 py-2 rounded-xl hover:bg-gray-800 transition text-white font-medium"
          >
            <img src={GitHubIcon} alt="GitHub" className="w-5 h-5 bg-white rounded" />
            <span>Continue with GitHub</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;
