import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import Navbar from '@/components/shared/Navbar'
import Sidebar from '@/components/shared/Sidebar'
import { ROLE_ROUTES } from '@/utils/constants'

const DashboardLayout = () => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Redirect based on role when accessing /dashboard
  useEffect(() => {
    if (profile && location.pathname === '/dashboard') {
      const defaultRoute = ROLE_ROUTES[profile.role]
      if (defaultRoute) {
        navigate(defaultRoute, { replace: true })
      }
    }
  }, [profile, location.pathname, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Memuatkan...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
