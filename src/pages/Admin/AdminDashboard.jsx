import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Users, UserCheck, UserX, Clock, TrendingUp } from 'lucide-react'
import Card from '@/components/shared/Card'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import { formatDate, formatTime, getGreeting } from '@/utils/helpers'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

const AdminDashboard = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    attendanceRate: 0
  })
  const [recentAttendance, setRecentAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const timeout = setTimeout(() => {
      setLoading(false)
      toast.error('Request timeout - sila refresh page')
    }, 10000) // 10 second timeout

    try {
      // Get total students
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0]
      const { data: todayAttendance } = await supabase
        .from('attendance_logs')
        .select('status')
        .eq('date', today)

      const presentToday = todayAttendance?.filter(a => a.status === 'PRESENT').length || 0
      const lateToday = todayAttendance?.filter(a => a.status === 'LATE').length || 0
      const absentToday = (totalStudents || 0) - (presentToday + lateToday)
      const attendanceRate = totalStudents > 0 ? Math.round(((presentToday + lateToday) / totalStudents) * 100) : 0

      setStats({
        totalStudents: totalStudents || 0,
        presentToday,
        absentToday,
        lateToday,
        attendanceRate
      })

      // Get recent attendance (NO NESTED JOIN)
      const { data: recent } = await supabase
        .from('attendance_logs')
        .select('*')
        .order('scan_time', { ascending: false })
        .limit(10)

      if (recent && recent.length > 0) {
        // Fetch related data separately
        const studentIds = [...new Set(recent.map(r => r.student_id))]
        const recorderIds = [...new Set(recent.map(r => r.recorded_by).filter(Boolean))]

        const [studentsData, recordersData] = await Promise.all([
          supabase.from('students').select('id, full_name, my_kid, class_id').in('id', studentIds),
          supabase.from('profiles').select('id, full_name').in('id', recorderIds)
        ])

        // Get class info
        const classIds = [...new Set(studentsData.data?.map(s => s.class_id).filter(Boolean) || [])]
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, name')
          .in('id', classIds)

        // Create maps
        const classMap = {}
        classesData?.forEach(c => { classMap[c.id] = c })

        const studentMap = {}
        studentsData.data?.forEach(s => {
          studentMap[s.id] = {
            ...s,
            class: s.class_id ? classMap[s.class_id] : null
          }
        })

        const recorderMap = {}
        recordersData.data?.forEach(r => { recorderMap[r.id] = r })

        // Enrich data
        const enrichedRecent = recent.map(log => ({
          ...log,
          student: studentMap[log.student_id] || null,
          recorder: recorderMap[log.recorded_by] || null
        }))

        setRecentAttendance(enrichedRecent)
      } else {
        setRecentAttendance([])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Gagal memuatkan data')
    } finally {
      clearTimeout(timeout)
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
          Berikut adalah ringkasan sistem kehadiran hari ini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lewat</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.lateToday}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tidak Hadir</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.absentToday}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance Rate */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Kadar Kehadiran Hari Ini</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.attendanceRate}%</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.presentToday + stats.lateToday} daripada {stats.totalStudents} murid hadir
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-primary-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.attendanceRate}%` }}
          />
        </div>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Kehadiran Terkini</h2>
          <Link 
            to="/admin/attendance" 
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Lihat Semua →
          </Link>
        </div>

        {recentAttendance.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Tiada rekod kehadiran lagi hari ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Murid</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Kelas</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Masa</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Direkod Oleh</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <Avatar name={record.student?.full_name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {record.student?.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {record.student?.mykid}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {record.student?.class?.name || '-'}
                    </td>
                    <td className="py-3 px-2">
                      <Badge status={record.status} />
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {formatTime(record.scan_time)}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {record.recorder?.full_name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/students">
          <Card className="hover:shadow-md transition-shadow cursor-pointer text-center">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Urus Murid</p>
          </Card>
        </Link>
        
        <Link to="/admin/teachers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer text-center">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Urus Guru</p>
          </Card>
        </Link>
        
        <Link to="/admin/classes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer text-center">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Urus Kelas</p>
          </Card>
        </Link>
        
        <Link to="/admin/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer text-center">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Laporan</p>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard