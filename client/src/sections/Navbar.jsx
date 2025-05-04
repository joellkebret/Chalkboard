import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignIn = () => navigate('/login');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    navigate('/', { state: { scrollTo: 'home' } });
  };

  const scrollToSection = (id) => {
    navigate('/', { state: { scrollTo: id } });
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#1e232a] shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div
          className="text-2xl font-bold text-white cursor-pointer"
          onClick={() => scrollToSection('home')}
        >
          🧠 Chalkboard
        </div>

        <ul className="hidden md:flex space-x-6 text-white font-medium">
          <li><button onClick={() => scrollToSection('home')} className="hover:text-lime-400 transition">Home</button></li>
          <li><button onClick={() => scrollToSection('about')} className="hover:text-lime-400 transition">About</button></li>
          <li><button onClick={() => scrollToSection('features')} className="hover:text-lime-400 transition">Features</button></li>
          <li><button onClick={() => scrollToSection('faq')} className="hover:text-lime-400 transition">FAQ</button></li>
        </ul>

        <div className="flex items-center space-x-4">
          <button className="text-white text-2xl md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div className="relative">
            {!user && (
              <button
                onClick={handleSignIn}
                className={`bg-lime-400 text-black px-6 py-3 rounded hover:bg-lime-500 transition font-semibold
                ${mobileMenuOpen ? 'hidden md:inline-block' : ''}`}
              >
                Sign In
              </button>
            )}
            {user && (
              <div>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2"
                >
                  <img
                    src={user.user_metadata?.avatar_url || 'https://i.pravatar.cc/40'}
                    alt="User"
                    className="w-9 h-9 rounded-full border"
                  />
                  <span className="text-white">{user.user_metadata?.name || 'User'}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
                    <button
                      onClick={() => navigate('/settings')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-4 text-white text-lg">
          <button onClick={() => scrollToSection('home')} className="block hover:text-lime-400 transition">Home</button>
          <button onClick={() => scrollToSection('about')} className="block hover:text-lime-400 transition">About</button>
          <button onClick={() => scrollToSection('features')} className="block hover:text-lime-400 transition">Features</button>
          <button onClick={() => scrollToSection('faq')} className="block hover:text-lime-400 transition">FAQ</button>

          {!user ? (
            <button
              onClick={handleSignIn}
              className="w-full bg-lime-400 text-black px-6 py-3 rounded hover:bg-lime-500 transition font-semibold"
            >
              Sign In
            </button>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 bg-white text-black rounded"
              >
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 bg-white text-red-500 rounded"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
