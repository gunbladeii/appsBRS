import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Plus, Search, Edit, Trash2, QrCode } from 'lucide-react'
import Card from '@/components/shared/Card'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import QRCodeModal from '@/components/modals/QRCodeModal'
import StudentModal from '@/components/modals/StudentModal'
import { toast } from 'sonner'

const StudentsPage = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [showStudentModal, setShowStudentModal] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          class:classes (name),
          parent:profiles!students_parent_id_fkey (full_name)
        `)
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
    student.mbk_category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Senarai Murid</h1>
          <p className="text-gray-600 mt-1">Urus maklumat murid berkeperluan khas</p>
        </div>
        
        <button 
          onClick={() => {
            setEditStudent(null)
            setShowStudentModal(true)
          }}
          className="btn-primary flex items-center justify-center gap-2 w-full lg:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Murid</span>
        </button>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari murid (nama, MyKid, kategori)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          
          <select className="input w-full lg:w-48">
            <option value="">Semua Kelas</option>
            <option value="1 Bestari">1 Bestari</option>
            <option value="PKBP Mawar">PKBP Mawar</option>
          </select>
        </div>
      </Card>

      {/* Students List */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menunjukkan {filteredStudents.length} daripada {students.length} murid
          </p>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Tiada murid dijumpai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Murid</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">MyKid</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Kelas</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Kategori MBK</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Ibu Bapa</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.full_name} size="md" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.full_name}
                          </p>
                          <Badge 
                            variant={student.is_active ? 'success' : 'danger'}
                            className="mt-1"
                          >
                            {student.is_active ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {student.my_kid}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {student.class?.name || '-'}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="info">
                        {student.mbk_category || 'Tiada'}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {student.parent?.full_name || '-'}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student)
                            setShowQRModal(true)
                          }}
                          className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Lihat QR Code"
                        >
                          <QrCode className="w-4 h-4 text-primary-600" />
                        </button>
                        <button
                          onClick={() => {
                            setEditStudent(student)
                            setShowStudentModal(true)
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Padam murid ini?')) {
                              const { error } = await supabase
                                .from('students')
                                .delete()
                                .eq('id', student.id)
                              if (error) {
                                toast.error('Gagal padam murid')
                              } else {
                                toast.success('Murid berjaya dipadam')
                                fetchStudents()
                              }
                            }
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Padam"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* QR Code Modal */}
      {showQRModal && selectedStudent && (
        <QRCodeModal
          student={selectedStudent}
          onClose={() => {
            setShowQRModal(false)
            setSelectedStudent(null)
          }}
        />
      )}

      {/* Student Modal (Create/Edit) */}
      {showStudentModal && (
        <StudentModal
          student={editStudent}
          onClose={() => {
            setShowStudentModal(false)
            setEditStudent(null)
          }}
          onSuccess={fetchStudents}
        />
      )}
    </div>
  )
}

export default StudentsPage