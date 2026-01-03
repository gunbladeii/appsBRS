import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Bell, Check, Trash2, AlertCircle } from 'lucide-react'
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
    if (!confirm('Padam notifikasi ini?')) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success('Notifikasi dipadam')
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ATTENDANCE':
        return <Check className="w-5 h-5 text-green-600" />
      case 'ALERT':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Bell className="w-5 h-5 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Tiada notifikasi baharu'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn-primary flex items-center gap-2 w-full lg:w-auto justify-center"
          >
            <Check className="w-4 h-4" />
            <span>Tanda Semua Dibaca</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'ALL'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'UNREAD'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Belum Dibaca ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('READ')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'READ'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dibaca ({notifications.length - unreadCount})
          </button>
        </div>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuatkan notifikasi...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Tiada notifikasi</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.is_read
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white'
              }`}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatDate(notification.created_at)}</span>
                        <span>•</span>
                        <span>{formatTime(notification.created_at)}</span>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <Badge variant="info" className="ml-2">Baharu</Badge>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Tanda Dibaca
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Padam
                    </button>
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
