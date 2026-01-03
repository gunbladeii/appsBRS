import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Search, Download, Calendar, Filter } from 'lucide-react'
import Card from '@/components/shared/Card'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import { formatDate, formatTime, downloadCSV } from '@/utils/helpers'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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
      let query = supabase
        .from('attendance_logs')
        .select('*')
        .order('scan_time', { ascending: false })

      if (dateFilter) {
        query = query.eq('date', dateFilter)
      }

      if (statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Fetch student details separately to avoid RLS issues
      if (data && data.length > 0) {
        const studentIds = [...new Set(data.map(log => log.student_id))]
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, full_name, my_kid, class_id')
          .in('id', studentIds)
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', [...new Set(data.map(log => log.recorded_by))])
        
        // Merge data
        const enrichedData = data.map(log => ({
          ...log,
          student: studentsData?.find(s => s.id === log.student_id) || null,
          recorded_by_user: profilesData?.find(p => p.id === log.recorded_by) || null
        }))
        
        setAttendanceLogs(enrichedData)
      } else {
        setAttendanceLogs([])
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      toast.error('Gagal memuatkan data kehadiran')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = attendanceLogs.filter(log =>
    log.student?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.student?.my_kid.includes(searchTerm)
  )

  const handleExportCSV = () => {
    const csvData = filteredLogs.map(log => ({
      'Tarikh': formatDate(log.date),
      'Masa': formatTime(log.scan_time),
      'Nama Murid': log.student?.full_name || '-',
      'MyKid': log.student?.my_kid || '-',
      'Kelas': log.student?.class?.name || '-',
      'Status': log.status,
      'Direkod Oleh': log.recorded_by_user?.full_name || '-',
      'Catatan': log.remarks || '-'
    }))

    downloadCSV(csvData, `Kehadiran_${dateFilter || 'Semua'}`)
    toast.success('Data berjaya dieksport ke CSV')
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(18)
    doc.text('Laporan Kehadiran Murid', 14, 20)
    
    // Date info
    doc.setFontSize(11)
    doc.text(`Tarikh: ${dateFilter ? formatDate(dateFilter) : 'Semua'}`, 14, 30)
    doc.text(`Jumlah Rekod: ${filteredLogs.length}`, 14, 36)
    
    // Table
    const tableData = filteredLogs.map(log => [
      formatDate(log.date),
      formatTime(log.scan_time),
      log.student?.full_name || '-',
      log.student?.my_kid || '-',
      log.student?.class?.name || '-',
      log.status
    ])

    doc.autoTable({
      startY: 45,
      head: [['Tarikh', 'Masa', 'Nama', 'MyKid', 'Kelas', 'Status']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235] }
    })

    doc.save(`Kehadiran_${dateFilter || 'Semua'}.pdf`)
    toast.success('PDF berjaya dimuat turun')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Rekod Kehadiran</h1>
          <p className="text-gray-600 mt-1">Paparan dan eksport data kehadiran murid</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="btn-secondary flex items-center gap-2"
            disabled={filteredLogs.length === 0}
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center gap-2"
            disabled={filteredLogs.length === 0}
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarikh
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Status Filter */}
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
                <option value="EXCUSED">Cuti</option>
              </select>
            </div>
          </div>

          {/* Search */}
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

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-600">Jumlah Rekod</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filteredLogs.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Hadir</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {filteredLogs.filter(l => l.status === 'PRESENT').length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Lewat</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {filteredLogs.filter(l => l.status === 'LATE').length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Tidak Hadir</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {filteredLogs.filter(l => l.status === 'ABSENT').length}
          </p>
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
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Direkod Oleh</th>
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
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {log.recorded_by_user?.full_name || '-'}
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
