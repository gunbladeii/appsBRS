import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Calendar, Search, Filter } from 'lucide-react'
import Card from '@/components/shared/Card'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import { formatDate, formatTime } from '@/utils/helpers'
import { toast } from 'sonner'

const AttendancePage = () => {
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchAttendance()
  }, [dateFilter, statusFilter])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      
      // Fetch attendance logs
      let query = supabase
        .from('attendance_logs')
        .select('*')
        .order('scan_time', { ascending: false })
        .limit(100)

      if (dateFilter) {
        query = query.eq('date', dateFilter)
      }

      if (statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter)
      }

      const { data: logs, error: logsError } = await query
      if (logsError) throw logsError

      // Fetch students separately
      const studentIds = [...new Set(logs.map(log => log.student_id))]
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, full_name, my_kid, class_id')
        .in('id', studentIds)
      
      if (studentsError) throw studentsError

      // Fetch classes separately
      const classIds = [...new Set(students.map(s => s.class_id).filter(Boolean))]
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .in('id', classIds)
      
      if (classesError) throw classesError

      // Create lookups
      const classMap = {}
      classes.forEach(c => {
        classMap[c.id] = c
      })

      const studentMap = {}
      students.forEach(s => {
        studentMap[s.id] = {
          ...s,
          class: s.class_id ? classMap[s.class_id] : null
        }
      })

      // Enrich logs with student data
      const enrichedLogs = logs.map(log => ({
        ...log,
        student: studentMap[log.student_id] || null
      }))

      setAttendanceLogs(enrichedLogs)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuatkan data kehadiran')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = attendanceLogs.filter(log =>
    log.student?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.student?.my_kid.includes(searchTerm)
  )

  const stats = {
    total: filteredLogs.length,
    present: filteredLogs.filter(l => l.status === 'PRESENT').length,
    late: filteredLogs.filter(l => l.status === 'LATE').length,
    absent: filteredLogs.filter(l => l.status === 'ABSENT').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Rekod Kehadiran</h1>
        <p className="text-gray-600 mt-1">Paparan kehadiran murid</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarikh
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input pl-10 pr-3 w-full"
                style={{ colorScheme: 'light' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-10 w-full"
              >
                <option value="ALL">Semua</option>
                <option value="PRESENT">Hadir</option>
                <option value="LATE">Lewat</option>
                <option value="ABSENT">Tidak Hadir</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Murid
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nama atau MyKid..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-600">Jumlah</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Hadir</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.present}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Lewat</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.late}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Tidak Hadir</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.absent}</p>
        </Card>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">Memuatkan data...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Tiada rekod kehadiran dijumpai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Murid</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">MyKid</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Masa</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={log.student?.full_name || ''} size="sm" />
                        <span className="text-sm font-medium text-gray-900">
                          {log.student?.full_name || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {log.student?.my_kid || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {log.student?.class?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatTime(log.scan_time)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={log.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default AttendancePage
