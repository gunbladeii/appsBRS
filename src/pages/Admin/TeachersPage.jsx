import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Search, Mail, Phone, Plus } from 'lucide-react'
import Card from '@/components/shared/Card'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import TeacherModal from '@/components/modals/TeacherModal'
import { toast } from 'sonner'

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showTeacherModal, setShowTeacherModal] = useState(false)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    const timeout = setTimeout(() => {
      setLoading(false)
      toast.error('Request timeout - sila refresh page')
    }, 10000)

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'TEACHER')
        .order('full_name')

      if (error) throw error
      setTeachers(data || [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
      toast.error('Gagal memuatkan data guru')
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Senarai Guru</h1>
          <p className="text-gray-600 mt-1">Maklumat guru dan kelas yang diajar</p>
        </div>
        
        <button 
          onClick={() => setShowTeacherModal(true)}
          className="btn-primary flex items-center justify-center gap-2 w-full lg:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Daftar Guru</span>
        </button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari guru..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </Card>

      {/* Teachers Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuatkan data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <Avatar name={teacher.full_name} size="xl" className="mb-4" />
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {teacher.full_name}
                </h3>
                
                <Badge variant="info" className="mb-4">
                  Guru
                </Badge>

                <div className="w-full space-y-3 pt-4 border-t text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  
                  {teacher.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{teacher.phone}</span>
                    </div>
                  )}

                  {/* Classes info temporarily removed - will add separately */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredTeachers.length === 0 && !loading && (
        <Card className="text-center py-12">
          <p className="text-gray-600">Tiada guru dijumpai</p>
        </Card>
      )}

      {/* Teacher Modal */}
      {showTeacherModal && (
        <TeacherModal
          onClose={() => setShowTeacherModal(false)}
          onSuccess={fetchTeachers}
        />
      )}
    </div>
  )
}

export default TeachersPage
