import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const StudentModal = ({ student, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [parents, setParents] = useState([])
  const [formData, setFormData] = useState({
    full_name: '',
    my_kid: '',
    date_of_birth: '',
    mbk_category: '',
    class_id: '',
    parent_id: '',
    is_active: true
  })

  useEffect(() => {
    fetchClassesAndParents()
    if (student) {
      setFormData({
        full_name: student.full_name || '',
        my_kid: student.my_kid || '',
        date_of_birth: student.date_of_birth || '',
        mbk_category: student.mbk_category || '',
        class_id: student.class_id || '',
        parent_id: student.parent_id || '',
        is_active: student.is_active ?? true
      })
    }
  }, [student])

  const fetchClassesAndParents = async () => {
    try {
      const [classesRes, parentsRes] = await Promise.all([
        supabase.from('classes').select('*').order('name'),
        supabase.from('profiles').select('id, full_name, email').eq('role', 'PARENT').order('full_name')
      ])

      if (classesRes.data) setClasses(classesRes.data)
      if (parentsRes.data) setParents(parentsRes.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (student) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update(formData)
          .eq('id', student.id)

        if (error) throw error
        toast.success('Murid berjaya dikemaskini')
      } else {
        // Create new student
        const { error } = await supabase
          .from('students')
          .insert([formData])

        if (error) throw error
        toast.success('Murid berjaya didaftarkan')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error(student ? 'Gagal mengemaskini murid' : 'Gagal mendaftar murid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {student ? 'Edit Murid' : 'Tambah Murid Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Penuh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="input"
                placeholder="Ahmad Bin Ali"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MyKid <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.my_kid}
                onChange={(e) => setFormData({ ...formData, my_kid: e.target.value })}
                className="input"
                placeholder="XXXXXX-XX-XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarikh Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori MBK <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.mbk_category}
                onChange={(e) => setFormData({ ...formData, mbk_category: e.target.value })}
                className="input"
              >
                <option value="">Pilih Kategori</option>
                <option value="Autisme">Autisme</option>
                <option value="Down Syndrome">Down Syndrome</option>
                <option value="ADHD">ADHD</option>
                <option value="Disleksia">Disleksia</option>
                <option value="Masalah Pembelajaran">Masalah Pembelajaran</option>
                <option value="Lain-lain">Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className="input"
              >
                <option value="">Pilih Kelas</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ibu Bapa
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                className="input"
              >
                <option value="">Pilih Ibu Bapa</option>
                {parents.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.full_name} ({parent.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Murid Aktif
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : student ? 'Kemaskini' : 'Daftar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentModal
