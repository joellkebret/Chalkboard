import { createClient } from '@supabase/supabase-js'

// Environment variables must be prefixed with VITE_ to be exposed in Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
