import { useState, useEffect } from 'react'
import api from '../../services/api'
import StatCard from '../../components/StatCard'
import StatutBadge from '../../components/StatutBadge'
import DataTable from '../../components/DataTable'

const DashboardPage = () => {
  const [vehicules, setVehicules] = useState([])
  const [testDrives, setTestDrives] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehRes, tdRes] = await Promise.all([
          api.get('/api/vehicules', { params: { statut: 'DISPONIBLE', limit: 200 } }).catch(() => ({ data: { data: { vehicules: [] } } })),
          api.get('/api/testdrive', { params: { statut: 'EN_ATTENTE', limit: 200 } }).catch(() => ({ data: { data: { testDrives: [] } } })),
        ])
        setVehicules(vehRes.data.data.vehicules || [])
        setTestDrives(tdRes.data.data.testDrives || [])
      } catch (err) {
        console.error('Erreur chargement dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Véhicules disponibles"
          icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          value={vehicules.length}
          subtitle="dans le catalogue"
        />
        <StatCard
          title="Test drives en attente"
          icon="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1h2m10 1l2-1V8a1 1 0 00-1-1h-4"
          value={testDrives.length}
          subtitle="à traiter"
        />
      </div>

      {testDrives.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Dernières demandes de test drive</h2>
          <DataTable
            columns={[
              { key: 'client', label: 'Client', render: (td) => `${td.client?.prenom} ${td.client?.nom}` },
              { key: 'vehicule', label: 'Véhicule', render: (td) => `${td.vehicule?.marque} ${td.vehicule?.modele}` },
              {
                key: 'date', label: 'Date souhaitée',
                render: (td) => new Date(td.dateHeure).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }),
              },
              { key: 'statut', label: 'Statut', render: (td) => <StatutBadge statut={td.statut} /> },
            ]}
            data={testDrives.slice(0, 5)}
          />
        </div>
      )}
    </div>
  )
}

export default DashboardPage
