// pages/Settings.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';

const Settings = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) return <div className="p-10 text-center text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
        <img
          src={user.user_metadata?.avatar_url || 'https://i.pravatar.cc/100'}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto mb-4 border"
        />
        <h2 className="text-xl font-bold mb-2">{user.user_metadata?.name || 'User'}</h2>
        <p className="text-gray-500 mb-6">{user.email}</p>
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
