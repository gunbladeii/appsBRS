import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Bell, Check, Trash2, AlertCircle, CheckCheck } from 'lucide-react'
import Card from '@/components/shared/Card'
import Badge from '@/components/shared/Badge'
import { formatDate, formatTime } from '@/utils/helpers'
import { toast } from 'sonner'

const NotificationsPage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    const timeout = setTimeout(() => {
      setLoading(false)
      toast.error('Request timeout - sila refresh page')
    }, 10000)

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuatkan notifikasi')
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      if (error) throw error
      
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      toast.success('Ditanda sebagai dibaca')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal mengemaskini notifikasi')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
      
      if (unreadIds.length === 0) {
        toast.info('Tiada notifikasi belum dibaca')
        return
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)

      if (error) throw error
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
      toast.success('Semua notifikasi ditanda sebagai dibaca')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal mengemaskini notifikasi')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Adakah anda pasti untuk memadam notifikasi ini?')) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success('Notifikasi berjaya dipadam')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memadam notifikasi')
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Adakah anda pasti untuk memadam SEMUA notifikasi?')) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user?.id)

      if (error) throw error
      
      setNotifications([])
      toast.success('Semua notifikasi berjaya dipadam')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memadam notifikasi')
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.is_read
    if (filter === 'READ') return n.is_read
    return true
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ABSENT':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'LATE':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Bell className="w-5 h-5 text-primary-500" />
    }
  }

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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Tiada notifikasi baharu'}
          </p>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn-secondary flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Tanda Semua Dibaca</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Padam Semua</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <Card>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'UNREAD'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Belum Dibaca ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('READ')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'READ'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Dibaca ({notifications.length - unreadCount})
          </button>
        </div>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'UNREAD' ? 'Tiada notifikasi belum dibaca' : 'Tiada notifikasi'}
            </h3>
            <p className="text-gray-500">
              Notifikasi akan dipaparkan di sini
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`transition-all ${
                !notif.is_read ? 'bg-blue-50 border-l-4 border-l-primary-500' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2" />
                    )}
                  </div>

                  <p className="text-gray-700 mb-3">{notif.message}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatDate(notif.created_at)}</span>
                      <span>•</span>
                      <span>{formatTime(notif.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Tanda sebagai dibaca"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Padam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
