import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { QrCode, Users, ClipboardCheck, TrendingUp } from 'lucide-react'
import Card from '@/components/shared/Card'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import { Link } from 'react-router-dom'
import { getGreeting, formatTime } from '@/utils/helpers'

const TeacherDashboard = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    scannedByMe: 0
  })
  const [recentScans, setRecentScans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id

      // Get total students
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0]
      const { data: todayAttendance } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('date', today)

      const presentToday = todayAttendance?.filter(a => a.status === 'PRESENT').length || 0
      const scannedByMe = todayAttendance?.filter(a => a.recorded_by === userId).length || 0

      setStats({
        totalStudents: totalStudents || 0,
        presentToday,
        scannedByMe
      })

      // Get recent scans by this teacher
      const { data: recent } = await supabase
        .from('attendance_logs')
        .select(`
          *,
          student:students (
            full_name,
            mykid,
            class:classes (name)
          )
        `)
        .eq('recorded_by', userId)
        .order('scan_time', { ascending: false })
        .limit(5)

      setRecentScans(recent || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          {getGreeting()}, {profile?.full_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Sistem kehadiran untuk murid berkeperluan khas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Card className="border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jumlah Murid</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hadir Hari Ini</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.presentToday}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Diimbas Oleh Saya</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.scannedByMe}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Action - Scanner */}
      <Link to="/teacher/scan">
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Imbas QR Code Murid</h3>
              <p className="text-primary-100 mt-1">Klik untuk memulakan pengimbasan kehadiran</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
              <QrCode className="w-8 h-8" />
            </div>
          </div>
        </Card>
      </Link>

      {/* Recent Scans */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Imbasan Terkini Saya</h2>

        {recentScans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <QrCode className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Belum ada imbasan hari ini</p>
            <Link to="/teacher/scan" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
              Mulakan Imbasan →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={scan.student?.full_name} size="md" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {scan.student?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {scan.student?.class?.name} • {scan.student?.mykid}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge status={scan.status} />
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(scan.scan_time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default TeacherDashboard