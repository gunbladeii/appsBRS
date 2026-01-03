import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Calendar, Download, TrendingUp, Users, CheckCircle2, XCircle } from 'lucide-react'
import Card from '@/components/shared/Card'
import { formatDate, downloadCSV } from '@/utils/helpers'
import { toast } from 'sonner'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const ReportsPage = () => {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    attendanceRate: 0,
    dailyStats: [],
    classwiseStats: []
  })

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    const timeout = setTimeout(() => {
      setLoading(false)
      toast.error('Request timeout - sila refresh page')
    }, 10000) // 10 second timeout

    try {
      setLoading(true)

      // Get total students
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Get attendance logs for date range (without JOIN)
      const { data: attendanceLogs } = await supabase
        .from('attendance_logs')
        .select('*')
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate)

      // Calculate stats
      const totalPresent = attendanceLogs?.filter(l => l.status === 'PRESENT').length || 0
      const totalLate = attendanceLogs?.filter(l => l.status === 'LATE').length || 0
      const totalAbsent = attendanceLogs?.filter(l => l.status === 'ABSENT').length || 0
      
      const totalRecords = attendanceLogs?.length || 0
      const attendanceRate = totalRecords > 0 
        ? ((totalPresent + totalLate) / totalRecords * 100).toFixed(1)
        : 0

      // Daily stats
      const dailyMap = {}
      attendanceLogs?.forEach(log => {
        if (!dailyMap[log.date]) {
          dailyMap[log.date] = { present: 0, late: 0, absent: 0 }
        }
        if (log.status === 'PRESENT') dailyMap[log.date].present++
        else if (log.status === 'LATE') dailyMap[log.date].late++
        else if (log.status === 'ABSENT') dailyMap[log.date].absent++
      })

      const dailyStats = Object.keys(dailyMap)
        .sort()
        .map(date => ({
          date,
          ...dailyMap[date]
        }))

      // Classwise stats (simplified without JOIN)
      const classMap = {}
      // Since we removed JOIN, we'll just show total stats
      // Can be enhanced later by fetching students separately
      classMap['Semua Kelas'] = {
        present: totalPresent,
        late: totalLate,
        absent: totalAbsent
      }

      const classwiseStats = Object.keys(classMap).map(className => ({
        className,
        ...classMap[className],
        total: classMap[className].present + classMap[className].late + classMap[className].absent
      }))

      setStats({
        totalStudents: totalStudents || 0,
        totalPresent,
        totalAbsent,
        totalLate,
        attendanceRate,
        dailyStats,
        classwiseStats
      })

    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Gagal memuatkan data laporan')
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    const csvData = stats.dailyStats.map(day => ({
      'Tarikh': formatDate(day.date),
      'Hadir': day.present,
      'Lewat': day.late,
      'Tidak Hadir': day.absent,
      'Jumlah': day.present + day.late + day.absent,
      'Kadar Kehadiran (%)': ((day.present + day.late) / (day.present + day.late + day.absent) * 100).toFixed(1)
    }))

    downloadCSV(csvData, `Laporan_${dateRange.startDate}_hingga_${dateRange.endDate}`)
    toast.success('Laporan berjaya dieksport')
  }

  // Chart Data
  const dailyChartData = {
    labels: stats.dailyStats.map(d => formatDate(d.date, { short: true })),
    datasets: [
      {
        label: 'Hadir',
        data: stats.dailyStats.map(d => d.present),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Lewat',
        data: stats.dailyStats.map(d => d.late),
        backgroundColor: 'rgba(234, 179, 8, 0.8)',
      },
      {
        label: 'Tidak Hadir',
        data: stats.dailyStats.map(d => d.absent),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      }
    ]
  }

  const classwiseChartData = {
    labels: stats.classwiseStats.map(c => c.className),
    datasets: [{
      label: 'Jumlah Kehadiran',
      data: stats.classwiseStats.map(c => c.present + c.late),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ]
    }]
  }

  const statusPieData = {
    labels: ['Hadir', 'Lewat', 'Tidak Hadir'],
    datasets: [{
      data: [stats.totalPresent, stats.totalLate, stats.totalAbsent],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ]
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Laporan & Analisis</h1>
          <p className="text-gray-600 mt-1">Statistik dan trend kehadiran murid</p>
        </div>
        <button
          onClick={handleExportReport}
          className="btn-primary flex items-center gap-2 w-full lg:w-auto justify-center"
          disabled={stats.dailyStats.length === 0}
        >
          <Download className="w-4 h-4" />
          <span>Eksport Laporan</span>
        </button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuatkan data...</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Jumlah Murid</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalStudents}</p>
                </div>
                <Users className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Hadir</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{stats.totalPresent}</p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Lewat</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.totalLate}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-yellow-600 opacity-50" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">Tidak Hadir</p>
                  <p className="text-3xl font-bold text-red-900 mt-1">{stats.totalAbsent}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-600 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Attendance Rate */}
          <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="text-center">
              <p className="text-lg font-medium opacity-90">Kadar Kehadiran Keseluruhan</p>
              <p className="text-5xl font-bold mt-2">{stats.attendanceRate}%</p>
              <p className="text-sm opacity-75 mt-2">
                Berdasarkan {stats.dailyStats.length} hari rekod
              </p>
            </div>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trend */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Harian</h3>
              <div className="h-80">
                <Bar data={dailyChartData} options={chartOptions} />
              </div>
            </Card>

            {/* Status Distribution */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Taburan Status</h3>
              <div className="h-80 flex items-center justify-center">
                <div className="w-full max-w-sm">
                  <Pie data={statusPieData} options={chartOptions} />
                </div>
              </div>
            </Card>

            {/* Classwise Attendance */}
            <Card className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kehadiran Mengikut Kelas</h3>
              <div className="h-80">
                <Bar data={classwiseChartData} options={chartOptions} />
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default ReportsPage
