import { useState, useEffect } from 'react'
import api from '../../services/api'
import StatCard from '../../components/StatCard'
import StatutBadge from '../../components/StatutBadge'
import DataTable from '../../components/DataTable'

const DashboardPage = () => {
  const [rdvJour, setRdvJour] = useState([])
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rdvRes, vehRes] = await Promise.all([
          api.get('/api/rdv/jour').catch(() => ({ data: { data: { rdv: [] } } })),
          api.get('/api/vehicules', { params: { statut: 'EN_REVISION', limit: 200 } }).catch(() => ({ data: { data: { vehicules: [] } } })),
        ])
        setRdvJour(rdvRes.data.data.rdv || [])
        setVehicules(vehRes.data.data.vehicules || [])
      } catch (err) {
        console.error('Erreur chargement dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const rdvEnAttente = rdvJour.filter(r => r.statut === 'EN_ATTENTE').length
  const rdvConfirme = rdvJour.filter(r => r.statut === 'CONFIRME').length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="skeleton h-32" />
          <div className="skeleton h-32" />
          <div className="skeleton h-32" />
        </div>
        <div className="skeleton h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="section-title">Vue d'ensemble</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="RDV du jour"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          value={rdvJour.length}
          subtitle={`${rdvConfirme} confirmés`}
        />
        <StatCard
          title="RDV en attente"
          icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          value={rdvEnAttente}
          subtitle="à confirmer"
        />
        <StatCard
          title="Véhicules en révision"
          icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          value={vehicules.length}
          subtitle="en cours"
        />
      </div>

      {rdvJour.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Prochains RDV</h2>
          <DataTable
            columns={[
              {
                key: 'heure', label: 'Heure',
                render: (r) => new Date(r.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              },
              { key: 'client', label: 'Client', render: (r) => `${r.client?.prenom} ${r.client?.nom}` },
              { key: 'motif', label: 'Motif' },
              { key: 'statut', label: 'Statut', render: (r) => <StatutBadge statut={r.statut} /> },
            ]}
            data={rdvJour}
          />
        </div>
      )}
    </div>
  )
}

export default DashboardPage
