import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { User, Lock, Save } from 'lucide-react'
import Card from '@/components/shared/Card'
import Avatar from '@/components/shared/Avatar'
import { toast } from 'sonner'

const ProfilePage = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    email: ''
  })
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        email: user?.email || ''
      })
    }
  }, [profile, user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Profil berjaya dikemaskini')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal mengemaskini profil')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Kata laluan baharu tidak sepadan')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Kata laluan mestilah sekurang-kurangnya 6 aksara')
      return
    }

    try {
      setLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error
      
      toast.success('Kata laluan berjaya ditukar')
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal menukar kata laluan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-600 mt-1">Urus maklumat profil anda</p>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <Avatar name={profile?.full_name || ''} size="2xl" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{profile?.full_name}</h3>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
              Guru
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">Maklumat Profil</h4>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Penuh *
            </label>
            <input
              type="text"
              required
              value={profileData.full_name}
              onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Telefon
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              placeholder="01x-xxx xxxx"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="input w-full bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email tidak boleh diubah</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">Tukar Kata Laluan</h4>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kata Laluan Baharu *
            </label>
            <input
              type="password"
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="input w-full"
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sahkan Kata Laluan Baharu *
            </label>
            <input
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="input w-full"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Menukar...' : 'Tukar Kata Laluan'}</span>
          </button>
        </form>
      </Card>
    </div>
  )
}

export default ProfilePage
