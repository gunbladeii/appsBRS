import { useAuth } from '@/contexts/AuthContext'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UserCircle, 
  School, 
  ClipboardCheck, 
  FileText, 
  Settings,
  QrCode,
  Heart,
  Bell
} from 'lucide-react'
import { ADMIN_NAV_ITEMS, TEACHER_NAV_ITEMS, PARENT_NAV_ITEMS } from '@/utils/constants'

const iconMap = {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCircle,
  School,
  ClipboardCheck,
  FileText,
  Settings,
  QrCode,
  User: UserCircle,
  Heart,
  Bell
}

const Sidebar = () => {
  const { profile } = useAuth()

  const getNavItems = () => {
    const role = profile?.role?.toUpperCase() // Handle both cases
    switch (role) {
      case 'ADMIN':
        return ADMIN_NAV_ITEMS
      case 'TEACHER':
        return TEACHER_NAV_ITEMS
      case 'PARENT':
        return PARENT_NAV_ITEMS
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon]
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = iconMap[item.icon]
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary-700'
                      : 'text-gray-600'
                  }`
                }
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span className="text-xs">{item.label.split(' ')[0]}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default Sidebar