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
      console.log('Starting OAuth login with:', provider);
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('OAuth Error:', error);
        throw error;
      }

      console.log('OAuth Response:', data);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in:', session.user);
          checkUserExists(session.user.id);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      alert(`${provider} login failed: ${error.message}`);
    }
  };

  const checkUserExists = async (userId) => {
    try {
      console.log('Checking if user exists:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking user:', error);
        throw error;
      }

      console.log('User check result:', data);

      if (!data) {
        console.log('User not found in public.users, waiting for trigger...');
        setTimeout(() => {
          navigate('/calendar');
        }, 1000);
      } else {
        console.log('User found in public.users:', data);
        navigate('/calendar');
      }
    } catch (error) {
      console.error('Error in checkUserExists:', error);
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return;

      if (user) {
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
            auth_provider: user.app_metadata?.provider || 'email',
            created_at: new Date().toISOString(),
          });

        if (userError) {
          console.error('Error creating user:', userError);
          return;
        }

        const { data: userData } = await supabase
          .from('users')
          .select('first_login_complete')
          .eq('id', user.id)
          .single();

        const preferences = userData?.first_login_complete;

        const redirect = localStorage.getItem('redirectAfterLogin');
        if (redirect) {
          localStorage.removeItem('redirectAfterLogin');
          navigate('/filter');
        } else if (!preferences) {
          navigate('/onboarding');
        } else {
          navigate('/calendar');
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
