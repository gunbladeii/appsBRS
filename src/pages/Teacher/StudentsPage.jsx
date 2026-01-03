import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Search, QrCode } from 'lucide-react'
import Card from '@/components/shared/Card'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import QRCodeModal from '@/components/modals/QRCodeModal'
import { toast } from 'sonner'

const StudentsPage = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes (name),
          parent:profiles!students_parent_id_fkey (full_name)
        `)
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuatkan data murid')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.my_kid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Senarai Murid</h1>
        <p className="text-gray-600 mt-1">Paparan murid aktif</p>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari murid..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-600">Jumlah Murid</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{students.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Hasil Carian</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">{filteredStudents.length}</p>
        </Card>
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuatkan data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <Avatar name={student.full_name} size="xl" className="mb-4" />
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {student.full_name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  MyKid: {student.my_kid}
                </p>

                <div className="flex gap-2 mb-4">
                  <Badge variant="info">{student.class?.name || 'Tiada Kelas'}</Badge>
                  {student.mbk_category && (
                    <Badge variant="warning">{student.mbk_category}</Badge>
                  )}
                </div>

                <div className="w-full pt-4 border-t space-y-2">
                  {student.parent && (
                    <p className="text-sm text-gray-600">
                      <strong>Ibu Bapa:</strong> {student.parent.full_name}
                    </p>
                  )}
                  
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Lihat QR Code</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredStudents.length === 0 && !loading && (
        <Card className="text-center py-12">
          <p className="text-gray-600">Tiada murid dijumpai</p>
        </Card>
      )}

      {/* QR Code Modal */}
      {selectedStudent && (
        <QRCodeModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  )
}

export default StudentsPage
