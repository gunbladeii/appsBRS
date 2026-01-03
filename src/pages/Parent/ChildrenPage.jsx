import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Users, Calendar, TrendingUp } from 'lucide-react'
import Card from '@/components/shared/Card'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import { formatDate, formatTime } from '@/utils/helpers'
import { toast } from 'sonner'

const ChildrenPage = () => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState(null)
  const [attendanceHistory, setAttendanceHistory] = useState([])

  useEffect(() => {
    fetchChildren()
  }, [user])

  useEffect(() => {
    if (selectedChild) {
      fetchAttendanceHistory(selectedChild.id)
    }
  }, [selectedChild])

  const fetchChildren = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes (name),
          attendance_logs (
            id,
            date,
            status,
            scan_time
          )
        `)
        .eq('parent_id', user?.id)
        .order('full_name')

      if (error) throw error
      const childrenData = data || []
      setChildren(childrenData)
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0])
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuatkan data anak')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceHistory = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error
      setAttendanceHistory(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuatkan sejarah kehadiran')
    }
  }

  const calculateStats = (child) => {
    const logs = child.attendance_logs || []
    const total = logs.length
    const present = logs.filter(l => l.status === 'PRESENT').length
    const late = logs.filter(l => l.status === 'LATE').length
    const absent = logs.filter(l => l.status === 'ABSENT').length
    const rate = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0

    return { total, present, late, absent, rate }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Anak-anak Saya</h1>
        <p className="text-gray-600 mt-1">Maklumat terperinci anak-anak</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuatkan data...</p>
        </div>
      ) : children.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Tiada maklumat anak dijumpai</p>
        </Card>
      ) : (
        <>
          {/* Children Tabs */}
          <Card>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedChild?.id === child.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {child.full_name}
                </button>
              ))}
            </div>
          </Card>

          {selectedChild && (
            <>
              {/* Child Details */}
              <Card>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center md:items-start">
                    <Avatar name={selectedChild.full_name} size="3xl" className="mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedChild.full_name}
                    </h2>
                    <p className="text-gray-600 mb-2">MyKid: {selectedChild.my_kid}</p>
                    <div className="flex gap-2">
                      <Badge variant="info">{selectedChild.class?.name || 'Tiada Kelas'}</Badge>
                      {selectedChild.mbk_category && (
                        <Badge variant="warning">{selectedChild.mbk_category}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Kehadiran</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {(() => {
                        const stats = calculateStats(selectedChild)
                        return (
                          <>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-blue-700 font-medium">Jumlah Rekod</p>
                              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <p className="text-sm text-green-700 font-medium">Hadir</p>
                              <p className="text-2xl font-bold text-green-900 mt-1">{stats.present}</p>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                              <p className="text-sm text-yellow-700 font-medium">Lewat</p>
                              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.late}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                              <p className="text-sm text-red-700 font-medium">Tidak Hadir</p>
                              <p className="text-2xl font-bold text-red-900 mt-1">{stats.absent}</p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    
                    <div className="mt-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <TrendingUp className="w-5 h-5" />
                        <p className="text-sm font-medium">Kadar Kehadiran</p>
                      </div>
                      <p className="text-3xl font-bold">{calculateStats(selectedChild).rate}%</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Attendance History */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Sejarah Kehadiran (30 Hari Terakhir)</h3>
                </div>

                {attendanceHistory.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">Tiada rekod kehadiran</p>
                ) : (
                  <div className="space-y-3">
                    {attendanceHistory.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{formatDate(log.date)}</p>
                          <p className="text-sm text-gray-600">{formatTime(log.scan_time)}</p>
                        </div>
                        <Badge status={log.status} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default ChildrenPage
