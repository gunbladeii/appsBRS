import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react'
import Card from '@/components/shared/Card'
import { toast } from 'sonner'

const ClassesPage = () => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    teacher_id: null,
    capacity: 20
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    const timeout = setTimeout(() => {
      setLoading(false)
      toast.error('Request timeout - sila refresh page')
    }, 10000)

    try {
      setLoading(true)
      const { data: classesData, error } = await supabase
        .from('classes')
        .select('*')
        .order('name')

      if (error) throw error
      
      // Fetch student counts for each class
      if (classesData && classesData.length > 0) {
        const classIds = classesData.map(c => c.id)
        
        // Get student counts
        const { data: studentsData } = await supabase
          .from('students')
          .select('class_id')
          .in('class_id', classIds)
        
        // Get teacher names
        const teacherIds = classesData.map(c => c.teacher_id).filter(Boolean)
        const { data: teachersData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', teacherIds)
        
        // Count students per class
        const studentCounts = {}
        studentsData?.forEach(s => {
          studentCounts[s.class_id] = (studentCounts[s.class_id] || 0) + 1
        })
        
        // Enrich classes with counts and teacher names
        const enrichedClasses = classesData.map(cls => ({
          ...cls,
          studentCount: studentCounts[cls.id] || 0,
          teacher: teachersData?.find(t => t.id === cls.teacher_id) || null
        }))
        
        setClasses(enrichedClasses)
      } else {
        setClasses([])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast.error('Gagal memuatkan data kelas')
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingClass) {
        // Update existing class
        const { error } = await supabase
          .from('classes')
          .update(formData)
          .eq('id', editingClass.id)

        if (error) throw error
        toast.success('Kelas berjaya dikemaskini')
      } else {
        // Create new class
        const { error } = await supabase
          .from('classes')
          .insert(formData)

        if (error) throw error
        toast.success('Kelas berjaya ditambah')
      }

      setShowModal(false)
      setEditingClass(null)
      setFormData({ name: '', teacher_id: null, capacity: 20 })
      fetchClasses()
    } catch (error) {
      console.error('Error saving class:', error)
      toast.error('Gagal menyimpan kelas')
    }
  }

  const handleEdit = (classItem) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      teacher_id: classItem.teacher_id,
      capacity: classItem.capacity || 20
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Adakah anda pasti untuk memadam kelas ini?')) return

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Kelas berjaya dipadam')
      fetchClasses()
    } catch (error) {
      console.error('Error deleting class:', error)
      toast.error('Gagal memadam kelas')
    }
  }

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Pengurusan Kelas</h1>
          <p className="text-gray-600 mt-1">Urus maklumat kelas dan guru kelas</p>
        </div>
        <button
          onClick={() => {
            setEditingClass(null)
            setFormData({ name: '', teacher_id: null, capacity: 20 })
            setShowModal(true)
          }}
          className="btn-primary flex items-center gap-2 w-full lg:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Kelas</span>
        </button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </Card>

      {/* Classes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuatkan data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {classItem.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Guru: {classItem.teacher?.full_name || 'Tiada'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(classItem)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(classItem.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Padam"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    {classItem.studentCount || 0} / {classItem.capacity || 20} murid
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Guru: {classItem.teacher?.full_name || 'Tiada'}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
            <Card>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {editingClass ? 'Edit Kelas' : 'Tambah Kelas Baharu'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input w-full"
                    placeholder="Contoh: 1 Amanah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasiti Murid *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="input w-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingClass ? 'Kemaskini' : 'Tambah'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingClass(null)
                    }}
                    className="btn-secondary flex-1"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default ClassesPage
