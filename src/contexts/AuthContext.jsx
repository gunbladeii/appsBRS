import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    checkUser()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    // Refresh session every 50 seconds to prevent timeout
    const refreshInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.auth.refreshSession()
        console.log('🔄 Session refreshed')
      }
    }, 50000) // 50 seconds

    return () => {
      authListener.subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        throw error
      }
      
      setProfile(data)
      
      // Cache role in localStorage for quick access
      if (data?.role) {
        localStorage.setItem('user-role', data.role)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Gagal mendapatkan maklumat profil')
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Auth error:', error)
        toast.error(error.message || 'Email atau kata laluan salah')
        setLoading(false)
        return { data: null, error }
      }

      setUser(data.user)
      await fetchProfile(data.user.id)
      
      toast.success('Berjaya log masuk!')
      setLoading(false)
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Gagal log masuk. Sila cuba lagi.')
      setLoading(false)
      return { data: null, error }
    }
  }

  const signUp = async (email, password, fullName, role = 'parent') => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (error) throw error

      toast.success('Akaun berjaya didaftar! Sila semak email anda.')
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(error.message || 'Gagal mendaftar')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      setUser(null)
      setProfile(null)
      localStorage.removeItem('user-role')
      
      toast.success('Berjaya log keluar')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Gagal log keluar')
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
