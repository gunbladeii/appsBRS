import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Calendar, Filter, Download } from 'lucide-react'
import Card from '@/components/shared/Card'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import { formatDate, formatTime, downloadCSV } from '@/utils/helpers'
import { toast } from 'sonner'

const AttendanceHistoryPage = () => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState('ALL')
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchChildren()
  }, [user])

  useEffect(() => {
    if (children.length > 0) {
      fetchAttendance()
    }
  }, [children, selectedChild, dateRange, statusFilter])

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name')
        .eq('parent_id', user?.id)
        .order('full_name')

      if (error) throw error
      setChildren(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuatkan data anak')
    }
  }

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('attendance_logs')
        .select(`
          *,
          student:students (
            id,
            full_name,
            my_kid,
            class:classes (name)
          )
        `)
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate)
        .order('date', { ascending: false })

      // Filter by child if selected
      if (selectedChild !== 'ALL') {
        query = query.eq('student_id', selectedChild)
      } else {
        // Show all children of this parent
        const childIds = children.map(c => c.id)
        query = query.in('student_id', childIds)
      }

      if (statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setAttendanceLogs(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuatkan sejarah kehadiran')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const csvData = attendanceLogs.map(log => ({
      'Tarikh': formatDate(log.date),
      'Masa': formatTime(log.scan_time),
      'Nama Anak': log.student?.full_name || '-',
      'MyKid': log.student?.my_kid || '-',
      'Kelas': log.student?.class?.name || '-',
      'Status': log.status
    }))

    const childName = selectedChild === 'ALL' ? 'Semua' : children.find(c => c.id === selectedChild)?.full_name
    downloadCSV(csvData, `Kehadiran_${childName}_${dateRange.startDate}_${dateRange.endDate}`)
    toast.success('Data berjaya dieksport')
  }

  const stats = {
    total: attendanceLogs.length,
    present: attendanceLogs.filter(l => l.status === 'PRESENT').length,
    late: attendanceLogs.filter(l => l.status === 'LATE').length,
    absent: attendanceLogs.filter(l => l.status === 'ABSENT').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Sejarah Kehadiran</h1>
          <p className="text-gray-600 mt-1">Rekod kehadiran anak-anak</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-primary flex items-center gap-2 w-full lg:w-auto justify-center"
          disabled={attendanceLogs.length === 0}
        >
          <Download className="w-4 h-4" />
          <span>Eksport CSV</span>
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anak
            </label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="input w-full"
            >
              <option value="ALL">Semua Anak</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarikh Mula
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarikh Akhir
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="input pl-10 w-full"
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

      {/* Attendance Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">Memuatkan data...</p>
          </div>
        ) : attendanceLogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Tiada rekod kehadiran dijumpai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Anak</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Tarikh</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Masa</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={log.student?.full_name || ''} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {log.student?.full_name || '-'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {log.student?.my_kid || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(log.date)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatTime(log.scan_time)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {log.student?.class?.name || '-'}
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

export default AttendanceHistoryPage
