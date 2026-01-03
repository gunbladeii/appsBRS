import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Search, Mail, Phone, Users, Plus } from 'lucide-react'
import Card from '@/components/shared/Card'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import ParentModal from '@/components/modals/ParentModal'
import { toast } from 'sonner'

const ParentsPage = () => {
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showParentModal, setShowParentModal] = useState(false)

  useEffect(() => {
    fetchParents()
  }, [])

  const fetchParents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'PARENT')
        .order('full_name')

      if (error) throw error
      setParents(data || [])
    } catch (error) {
      console.error('Error fetching parents:', error)
      toast.error('Gagal memuatkan data ibu bapa')
    } finally {
      setLoading(false)
    }
  }

  const filteredParents = parents.filter(parent =>
    parent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Senarai Ibu Bapa</h1>
          <p className="text-gray-600 mt-1">Maklumat ibu bapa dan anak-anak mereka</p>
        </div>
        
        <button 
          onClick={() => setShowParentModal(true)}
          className="btn-primary flex items-center justify-center gap-2 w-full lg:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Daftar Ibu Bapa</span>
        </button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari ibu bapa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </Card>

      {/* Parents Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuatkan data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParents.map((parent) => (
            <Card key={parent.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <Avatar name={parent.full_name} size="xl" className="mb-4" />
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {parent.full_name}
                </h3>
                
                <Badge variant="warning" className="mb-4">
                  Ibu Bapa
                </Badge>

                <div className="w-full space-y-3 pt-4 border-t text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{parent.email}</span>
                  </div>
                  
                  {parent.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{parent.phone}</span>
                    </div>
                  )}

                  {/* Children info will be loaded separately */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredParents.length === 0 && !loading && (
        <Card className="text-center py-12">
          <p className="text-gray-600">Tiada ibu bapa dijumpai</p>
        </Card>
      )}

      {/* Parent Modal */}
      {showParentModal && (
        <ParentModal
          onClose={() => setShowParentModal(false)}
          onSuccess={fetchParents}
        />
      )}
    </div>
  )
}

export default ParentsPage
