import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Heart, Bell, TrendingUp, Calendar } from 'lucide-react'
import Card from '@/components/shared/Card'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import { getGreeting, formatTime, formatDate } from '@/utils/helpers'
import { toast } from 'sonner'

const ParentDashboard = () => {
  const { profile } = useAuth()
  const [children, setChildren] = useState([])
  const [notifications, setNotifications] = useState([])
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
      const userId = (await supabase.auth.getUser()).data.user?.id

      // Get children (no JOIN)
      const { data: childrenData } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', userId)

      if (childrenData && childrenData.length > 0) {
        // Get class info separately
        const classIds = [...new Set(childrenData.map(c => c.class_id).filter(Boolean))]
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, name')
          .in('id', classIds)

        const classMap = {}
        classesData?.forEach(c => { classMap[c.id] = c })

        // Enrich children with class
        const enrichedChildren = childrenData.map(child => ({
          ...child,
          class: child.class_id ? classMap[child.class_id] : null
        }))

        // Get today's attendance
        const today = new Date().toISOString().split('T')[0]
        const childIds = childrenData.map(c => c.id)
        
        const { data: attendanceData } = await supabase
          .from('attendance_logs')
          .select('*')
          .in('student_id', childIds)
          .eq('date', today)

        // Merge attendance with children
        const childrenWithAttendance = enrichedChildren.map(child => ({
          ...child,
          todayAttendance: attendanceData?.find(a => a.student_id === child.id)
        }))
        
        setChildren(childrenWithAttendance)
      } else {
        setChildren([])
      }

      // Get recent notifications (no JOIN)
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (notifData && notifData.length > 0) {
        // Get student names separately
        const studentIds = [...new Set(notifData.map(n => n.student_id).filter(Boolean))]
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, full_name')
          .in('id', studentIds)

        const studentMap = {}
        studentsData?.forEach(s => { studentMap[s.id] = s })

        const enrichedNotifications = notifData.map(notif => ({
          ...notif,
          student: notif.student_id ? studentMap[notif.student_id] : null
        }))

        setNotifications(enrichedNotifications)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('Error:', error)
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
          Pantau kehadiran dan perkembangan anak anda
        </p>
      </div>

      {/* Children Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Anak-anak Saya
        </h2>

        {children.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500">
              <p>Tiada data anak dijumpai</p>
              <p className="text-sm mt-1">Sila hubungi pihak sekolah untuk pendaftaran</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar name={child.full_name} size="xl" />
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {child.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">{child.class?.name}</p>
                    <Badge variant="info" className="mt-2">
                      {child.mbk_category}
                    </Badge>
                    
                    {/* Today's Attendance Status */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        Status Hari Ini:
                      </p>
                      {child.todayAttendance ? (
                        <>
                          <div className="flex items-center justify-between">
                            <Badge status={child.todayAttendance.status} />
                            <span className="text-sm text-gray-700">
                              {formatTime(child.todayAttendance.scan_time)}
                            </span>
                          </div>
                          {child.todayAttendance.mood_note && (
                            <p className="text-xs text-gray-600 mt-2">
                              Mood: {child.todayAttendance.mood_note}
                            </p>
                          )}
                        </>
                      ) : (
                        <Badge variant="warning">Belum Direkod</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Summary */}
      {children.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Ringkasan Kehadiran (7 Hari Lepas)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">-</p>
              <p className="text-sm text-gray-600 mt-1">Hari Hadir</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">-</p>
              <p className="text-sm text-gray-600 mt-1">Hari Lewat</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">-</p>
              <p className="text-sm text-gray-600 mt-1">Hari Tidak Hadir</p>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-600" />
          Notifikasi Terkini
        </h3>

        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Tiada notifikasi baru</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border-l-4 ${
                  notif.is_read
                    ? 'bg-gray-50 border-gray-300'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{notif.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    {notif.student && (
                      <p className="text-xs text-gray-500 mt-2">
                        {notif.student.full_name}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatTime(notif.created_at)}
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

export default ParentDashboard