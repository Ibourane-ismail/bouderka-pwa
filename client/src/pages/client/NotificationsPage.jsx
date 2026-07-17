import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications')
      setNotifications(res.data.data.notifications || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const marquerLue = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/lue`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const marquerToutesLues = async () => {
    try {
      await api.put('/api/notifications/lire-toutes')
      setNotifications(prev => prev.map(n => ({ ...n, lue: true })))
      toast.success('Toutes les notifications marquées comme lues')
    } catch (err) {
      toast.error('Erreur')
    }
  }

  const nonLues = notifications.filter(n => !n.lue).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-20" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Notifications</h1>
        {nonLues > 0 && (
          <button onClick={marquerToutesLues} className="btn-outline text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Marquer tout lu ({nonLues})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="empty-state-title">Aucune notification</h3>
          <p className="empty-state-text">Vous n'avez aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.lue && marquerLue(n.id)}
              className={`content-card p-4 cursor-pointer transition-all duration-200 ${
                !n.lue ? 'ring-1 ring-accent/10' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.lue ? 'bg-transparent' : 'bg-accent'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${n.lue ? 'text-gray-600' : 'text-gray-900'}`}>{n.titre}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{n.message}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{new Date(n.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
