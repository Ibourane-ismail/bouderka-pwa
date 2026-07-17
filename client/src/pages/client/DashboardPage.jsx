import { useState, useEffect } from 'react'
import api from '../../services/api'
import StatCard from '../../components/StatCard'
import StatutBadge from '../../components/StatutBadge'
import DataTable from '../../components/DataTable'
import { SkeletonText } from '../../components/Skeleton'

const DashboardPage = () => {
  const [rdv, setRdv] = useState([])
  const [notifications, setNotifications] = useState([])
  const [entretiens, setEntretiens] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rdvRes, notifRes, entRes] = await Promise.all([
          api.get('/api/rdv/mes-rdv').catch(() => ({ data: { data: { rdv: [] } } })),
          api.get('/api/notifications').catch(() => ({ data: { data: { notifications: [] } } })),
          api.get('/api/entretien/mes-entretiens').catch(() => ({ data: { data: { entretiens: [] } } })),
        ])
        setRdv(rdvRes.data.data.rdv || [])
        setNotifications(notifRes.data.data.notifications || [])
        setEntretiens(entRes.data.data.entretiens || [])
      } catch (err) {
        console.error('Erreur chargement dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const prochainRdv = rdv.find(r => r.statut === 'EN_ATTENTE' || r.statut === 'CONFIRME')
  const nonLues = notifications.filter(n => !n.lue).length

  const alertes = []
  const now = new Date()
  entretiens.forEach(e => {
    if (e.prochainVideange) {
      alertes.push({ type: 'Vidange', message: `Prochaine vidange dans ${e.prochainVideange} km`, urgente: e.prochainVideange < 500 })
    }
    if (e.prochainControle) {
      const diff = (new Date(e.prochainControle) - now) / (1000 * 60 * 60 * 24)
      if (diff < 30) {
        alertes.push({ type: 'Contrôle technique', message: `Contrôle technique dans ${Math.ceil(diff)} jours`, urgente: diff < 7 })
      }
    }
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="skeleton h-32" />
          <div className="skeleton h-32" />
          <div className="skeleton h-32" />
        </div>
        <div className="skeleton h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="section-title">Vue d'ensemble</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Prochain RDV"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          value={prochainRdv ? prochainRdv.motif : '—'}
          subtitle={prochainRdv ? new Date(prochainRdv.dateHeure).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) : 'Aucun RDV prévu'}
        />
        <StatCard
          title="Notifications"
          icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          value={nonLues}
          subtitle="non lues"
        />
        <StatCard
          title="Entretiens"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          value={entretiens.length}
          subtitle="au total"
        />
      </div>

      {alertes.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Alertes entretien</h2>
          <div className="space-y-2">
            {alertes.map((a, i) => (
              <div key={i} className={a.urgente ? 'alert-urgent' : 'alert-warning'}>
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={a.urgente ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
                </svg>
                <div>
                  <p className="font-medium">{a.type}</p>
                  <p>{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Derniers rendez-vous</h2>
        <DataTable
          columns={[
            { key: 'date', label: 'Date', render: (r) => new Date(r.dateHeure).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) },
            { key: 'motif', label: 'Motif' },
            { key: 'statut', label: 'Statut', render: (r) => <StatutBadge statut={r.statut} /> },
          ]}
          data={rdv.slice(0, 5)}
        />
      </div>
    </div>
  )
}

export default DashboardPage
