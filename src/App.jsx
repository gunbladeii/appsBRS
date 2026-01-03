import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'

// Auth Pages
import LoginPage from './pages/Auth/LoginPage'

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout'
import DashboardRedirect from './components/shared/DashboardRedirect'

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard'
import StudentsPage from './pages/Admin/StudentsPage'
import TeachersPage from './pages/Admin/TeachersPage'
import ParentsPage from './pages/Admin/ParentsPage'
import ClassesPage from './pages/Admin/ClassesPage'
import AttendancePage from './pages/Admin/AttendancePage'
import ReportsPage from './pages/Admin/ReportsPage'
import SettingsPage from './pages/Admin/SettingsPage'

// Teacher Pages
import TeacherDashboard from './pages/Teacher/TeacherDashboard'
import ScannerPage from './pages/Teacher/ScannerPage'
import TeacherStudentsPage from './pages/Teacher/StudentsPage'
import TeacherAttendancePage from './pages/Teacher/AttendancePage'
import TeacherProfilePage from './pages/Teacher/ProfilePage'

// Parent Pages
import ParentDashboard from './pages/Parent/ParentDashboard'
import ChildrenPage from './pages/Parent/ChildrenPage'
import AttendanceHistoryPage from './pages/Parent/AttendanceHistoryPage'
import NotificationsPage from './pages/Parent/NotificationsPage'

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/*" element={<DashboardLayout />}>
              {/* Admin Routes */}
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/students" element={<StudentsPage />} />
              <Route path="admin/teachers" element={<TeachersPage />} />
              <Route path="admin/parents" element={<ParentsPage />} />
              <Route path="admin/classes" element={<ClassesPage />} />
              <Route path="admin/attendance" element={<AttendancePage />} />
              <Route path="admin/reports" element={<ReportsPage />} />
              <Route path="admin/settings" element={<SettingsPage />} />
              
              {/* Teacher Routes */}
              <Route path="teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="teacher/scan" element={<ScannerPage />} />
              <Route path="teacher/students" element={<TeacherStudentsPage />} />
              <Route path="teacher/attendance" element={<TeacherAttendancePage />} />
              <Route path="teacher/profile" element={<TeacherProfilePage />} />
              
              {/* Parent Routes */}
              <Route path="parent/dashboard" element={<ParentDashboard />} />
              <Route path="parent/children" element={<ChildrenPage />} />
              <Route path="parent/attendance" element={<AttendanceHistoryPage />} />
              <Route path="parent/notifications" element={<NotificationsPage />} />
              
              {/* Default Dashboard Route - Redirect based on role */}
              <Route path="dashboard" element={<DashboardRedirect />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          
          {/* Toast Notifications */}
          <Toaster 
            position="top-center" 
            richColors 
            closeButton
            duration={3000}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
