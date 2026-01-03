import { useEffect, useRef } from 'react'
import { X, Download, Printer } from 'lucide-react'
import QRCode from 'qrcode'
import { toast } from 'sonner'

const QRCodeModal = ({ student, onClose }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (student && canvasRef.current) {
      generateQRCode()
    }
  }, [student])

  const generateQRCode = async () => {
    try {
      await QRCode.toCanvas(canvasRef.current, student.qr_code_string || student.my_kid, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        }
      })
    } catch (error) {
      console.error('QR Code generation error:', error)
      toast.error('Gagal menjana QR code')
    }
  }

  const handleDownload = async () => {
    try {
      const canvas = canvasRef.current
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `QR_${student.full_name.replace(/\s+/g, '_')}_${student.my_kid}.png`
      link.href = url
      link.click()
      toast.success('QR code berjaya dimuat turun')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Gagal memuat turun QR code')
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/png')
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${student.full_name}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              border: 2px solid #333;
              padding: 30px;
              border-radius: 10px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            .info {
              margin: 20px 0;
              font-size: 16px;
              color: #555;
            }
            .qr-code {
              margin: 20px auto;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #888;
            }
            @media print {
              body {
                margin: 0;
              }
              .container {
                border: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${student.full_name}</h1>
            <div class="info">
              <p><strong>No. MyKid:</strong> ${student.my_kid}</p>
              <p><strong>Kelas:</strong> ${student.class?.name || '-'}</p>
              ${student.mbk_category ? `<p><strong>Kategori:</strong> ${student.mbk_category}</p>` : ''}
            </div>
            <div class="qr-code">
              <img src="${dataUrl}" alt="QR Code" />
            </div>
            <div class="footer">
              <p>Imbas QR code ini untuk rekod kehadiran</p>
              <p>Sistem Kehadiran Murid BRS</p>
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (!student) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
        <div className="bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-900">QR Code Murid</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-900 mb-1">
                {student.full_name}
              </h4>
              <p className="text-sm text-gray-600">MyKid: {student.my_kid}</p>
              {student.class && (
                <p className="text-sm text-gray-600">Kelas: {student.class.name}</p>
              )}
              {student.mbk_category && (
                <p className="text-sm text-gray-600">Kategori: {student.mbk_category}</p>
              )}
            </div>

            {/* QR Code Canvas */}
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block mb-6">
              <canvas ref={canvasRef}></canvas>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Imbas QR code ini untuk rekod kehadiran murid
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Muat Turun</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default QRCodeModal
