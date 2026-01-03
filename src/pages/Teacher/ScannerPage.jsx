import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Camera, QrCode, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import Card from '@/components/shared/Card'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import { formatTime } from '@/utils/helpers'

const ScannerPage = () => {
  const [scannerActive, setScannerActive] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState(null)
  const [scanResult, setScanResult] = useState(null)

  const handleScan = async (result) => {
    if (scanning || !result || !result[0]) return
    
    setScanning(true)
    const qrCode = result[0].rawValue

    try {
      // Find student by QR code
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          class:classes (name),
          parent:profiles!students_parent_id_fkey (full_name)
        `)
        .eq('qr_code_string', qrCode)
        .single()

      if (studentError || !student) {
        toast.error('QR Code tidak sah atau murid tidak dijumpai')
        playErrorSound()
        setScanResult({
          success: false,
          message: 'QR Code tidak sah'
        })
        setTimeout(() => {
          setScanning(false)
          setScanResult(null)
        }, 3000)
        return
      }

      // Check if already scanned today
      const today = new Date().toISOString().split('T')[0]
      const { data: existingAttendance } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('student_id', student.id)
        .eq('date', today)
        .single()

      if (existingAttendance) {
        toast.warning(`${student.full_name} sudah direkod hadir hari ini`)
        setScanResult({
          success: false,
          message: 'Sudah direkod',
          student,
          previousScan: existingAttendance
        })
        playWarningSound()
        setTimeout(() => {
          setScanning(false)
          setScanResult(null)
        }, 4000)
        return
      }

      // Record attendance
      const userId = (await supabase.auth.getUser()).data.user?.id
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_logs')
        .insert({
          student_id: student.id,
          recorded_by: userId,
          status: 'PRESENT',
          date: today
        })
        .select()
        .single()

      if (attendanceError) {
        toast.error('Gagal merekod kehadiran')
        playErrorSound()
        setScanning(false)
        return
      }

      // Success!
      toast.success(`Kehadiran ${student.full_name} berjaya direkod!`)
      playSuccessSound()
      
      setScanResult({
        success: true,
        student,
        attendance
      })
      
      setLastScan({
        student,
        time: new Date()
      })

      setTimeout(() => {
        setScanning(false)
        setScanResult(null)
      }, 3000)

    } catch (error) {
      console.error('Scan error:', error)
      toast.error('Ralat semasa memproses imbasan')
      playErrorSound()
      setScanning(false)
    }
  }

  const handleError = (error) => {
    console.error('Scanner error:', error)
    toast.error('Gagal mengakses kamera. Sila berikan kebenaran kamera.')
  }

  const playSuccessSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAo=')
    audio.play().catch(() => {})
  }

  const playErrorSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0Ya4AAAD//////////w==')
    audio.play().catch(() => {})
  }

  const playWarningSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0Ya4BAAD//////////w==')
    audio.play().catch(() => {})
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Imbasan QR Code</h1>
        <p className="text-gray-600 mt-1">Imbas QR code murid untuk rekod kehadiran</p>
      </div>

      {/* Scanner Card */}
      <Card className="max-w-2xl mx-auto">
        <div className="text-center">
          {!scannerActive ? (
            <>
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-12 h-12 text-primary-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sedia untuk Mengimbas
              </h3>
              <p className="text-gray-600 mb-6">
                Klik butang di bawah untuk mengaktifkan kamera dan mula mengimbas QR code murid
              </p>
              
              <button
                onClick={() => setScannerActive(true)}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Camera className="w-5 h-5" />
                <span>Aktifkan Kamera</span>
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {/* Scanner */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-square max-w-md mx-auto">
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  constraints={{
                    facingMode: 'environment',
                    aspectRatio: 1
                  }}
                  components={{
                    audio: false,
                    finder: true
                  }}
                  styles={{
                    container: { 
                      width: '100%', 
                      height: '100%' 
                    },
                    video: {
                      objectFit: 'cover'
                    }
                  }}
                />
                
                {/* Scanner Overlay */}
                <div className="absolute inset-0 border-4 border-primary-500 pointer-events-none">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white"></div>
                </div>

                {scanning && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Scan Result */}
              {scanResult && (
                <div className={`p-6 rounded-lg ${
                  scanResult.success 
                    ? 'bg-green-50 border-2 border-green-500' 
                    : 'bg-yellow-50 border-2 border-yellow-500'
                } animate-pulse-success`}>
                  {scanResult.success ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-green-900 mb-2">
                        Kehadiran Berjaya Direkod!
                      </h3>
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <Avatar name={scanResult.student.full_name} size="lg" />
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">
                            {scanResult.student.full_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {scanResult.student.class?.name}
                          </p>
                        </div>
                      </div>
                      <Badge status="PRESENT" className="text-base px-4 py-1" />
                    </>
                  ) : (
                    <>
                      <XCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-yellow-900 mb-2">
                        {scanResult.message}
                      </h3>
                      {scanResult.student && (
                        <>
                          <div className="flex items-center justify-center gap-3 mb-3">
                            <Avatar name={scanResult.student.full_name} size="lg" />
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">
                                {scanResult.student.full_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {scanResult.student.class?.name}
                              </p>
                            </div>
                          </div>
                          {scanResult.previousScan && (
                            <p className="text-sm text-gray-600">
                              Direkod pada: {formatTime(scanResult.previousScan.scan_time)}
                            </p>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              <button
                onClick={() => setScannerActive(false)}
                className="btn-secondary"
              >
                Tutup Kamera
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Last Scan */}
      {lastScan && (
        <Card className="max-w-2xl mx-auto bg-green-50 border-green-200">
          <h3 className="font-semibold text-gray-900 mb-3">Imbasan Terakhir:</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={lastScan.student.full_name} size="md" />
              <div>
                <p className="font-medium text-gray-900">{lastScan.student.full_name}</p>
                <p className="text-sm text-gray-600">{lastScan.student.class?.name}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{formatTime(lastScan.time)}</p>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Panduan Penggunaan:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Pastikan QR code jelas dan tidak terhalang</li>
              <li>Jarak ideal: 10-30cm dari kamera</li>
              <li>Sistem akan bunyi apabila imbasan berjaya</li>
              <li>Rekod kehadiran akan disimpan automatik</li>
              <li>Duplicate scan akan ditolak untuk hari yang sama</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ScannerPage