import { useEffect, useState } from 'react'
import { supabase } from '../supabase/supabaseClient' // adjust path if needed

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    // Load user if signed in
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setDropdownOpen(false)
  }

  return (
    <nav className="w-[99%] mx-auto mt-2 rounded-xl flex justify-between items-center px-6 py-4 bg-black shadow-md">
      <div className="text-2xl font-bold text-white">🧠 Chalkboard</div>

      <div className="relative">
        {!user ? (
          <button
            onClick={handleSignIn}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        ) : (
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
                  onClick={() => alert('Settings clicked')}
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
    </nav>
  )
}
