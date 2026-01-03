import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { User, Lock, Bell, Save } from 'lucide-react'
import Card from '@/components/shared/Card'
import Avatar from '@/components/shared/Avatar'
import { toast } from 'sonner'

const SettingsPage = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    email: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    attendanceAlerts: true,
    weeklyReports: false
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
      console.error('Error updating profile:', error)
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
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Gagal menukar kata laluan')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = () => {
    // In a real app, this would save to database
    toast.success('Tetapan notifikasi berjaya disimpan')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tetapan</h1>
        <p className="text-gray-600 mt-1">Urus profil dan tetapan akaun anda</p>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <Avatar name={profile?.full_name || ''} size="2xl" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{profile?.full_name}</h3>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
              {profile?.role}
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

      {/* Notification Settings Card */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gray-600" />
          <h4 className="text-lg font-semibold text-gray-900">Tetapan Notifikasi</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">Notifikasi Email</p>
              <p className="text-sm text-gray-600">Terima notifikasi melalui email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  emailNotifications: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">Notifikasi Push</p>
              <p className="text-sm text-gray-600">Terima notifikasi push pada peranti</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  pushNotifications: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">Makluman Kehadiran</p>
              <p className="text-sm text-gray-600">Notifikasi apabila murid hadir/tidak hadir</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.attendanceAlerts}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  attendanceAlerts: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Laporan Mingguan</p>
              <p className="text-sm text-gray-600">Terima ringkasan laporan setiap minggu</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.weeklyReports}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  weeklyReports: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        <button
          onClick={handleSaveNotifications}
          className="btn-primary flex items-center gap-2 mt-4"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Tetapan</span>
        </button>
      </Card>
    </div>
  )
}

export default SettingsPage
