import { createClient } from '@supabase/supabase-js'

// Dapatkan credentials dari environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validation check
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase credentials tidak dijumpai!')
  console.error('Sila pastikan .env file anda mengandungi:')
  console.error('VITE_SUPABASE_URL=your-supabase-url')
  console.error('VITE_SUPABASE_ANON_KEY=your-anon-key')
}

// Create Supabase client dengan configuration optimized untuk realtime
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'mykehadiran-auth'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

/**
 * Helper function untuk check user role
 * @returns {Promise<string|null>} Role pengguna atau null jika tidak login
 */
export const getUserRole = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching role:', profileError)
      return null
    }

    return profile?.role || null
  } catch (error) {
    console.error('Error in getUserRole:', error)
    return null
  }
}

/**
 * Helper function untuk check authentication status
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
}

/**
 * Helper function untuk logout
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Clear any local storage items
    localStorage.removeItem('mykehadiran-user-role')
    
    // Redirect to login
    window.location.href = '/login'
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export default supabase
