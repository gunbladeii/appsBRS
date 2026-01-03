import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROLE_ROUTES } from '@/utils/constants'

const DashboardRedirect = () => {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  // Redirect based on role (handle both uppercase and lowercase)
  const defaultRoute = ROLE_ROUTES[profile.role] || ROLE_ROUTES[profile.role?.toLowerCase()] || '/admin/dashboard'
  
  return <Navigate to={defaultRoute} replace />
}

export default DashboardRedirect
