import { useState, useEffect } from 'react'
import api from '../../services/api'
import StatCard from '../../components/StatCard'

const DashboardPage = () => {
  const [clients, setClients] = useState([])
  const [vehicules, setVehicules] = useState([])
  const [rdv, setRdv] = useState([])
  const [ventesStats, setVentesStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cliRes, vehRes, rdvRes, ventesRes] = await Promise.all([
          api.get('/api/clients').catch(() => ({ data: { data: { clients: [] } } })),
          api.get('/api/vehicules', { params: { limit: 500 } }).catch(() => ({ data: { data: { vehicules: [] } } })),
          api.get('/api/rdv/jour').catch(() => ({ data: { data: { rdv: [] } } })),
          api.get('/api/ventes/stats').catch(() => ({ data: { data: null } })),
        ])
        setClients(cliRes.data.data.clients || [])
        setVehicules(vehRes.data.data.vehicules || [])
        setRdv(rdvRes.data.data.rdv || [])
        setVentesStats(ventesRes.data.data)
      } catch (err) {
        console.error('Erreur chargement dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const clientsActifs = clients.filter(c => c.actif).length
  const vehStats = {
    DISPONIBLE: vehicules.filter(v => v.statut === 'DISPONIBLE').length,
    EN_REVISION: vehicules.filter(v => v.statut === 'EN_REVISION').length,
    VENDU: vehicules.filter(v => v.statut === 'VENDU').length,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="skeleton h-32" />
          <div className="skeleton h-32" />
          <div className="skeleton h-32" />
          <div className="skeleton h-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="skeleton h-48" />
          <div className="skeleton h-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="section-title">Vue d'ensemble</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Clients"
          icon="M12 4.354a4 4 0 110 7.292 4 4 0 010-7.292zM15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          value={clients.length}
          subtitle={`${clientsActifs} actifs`}
        />
        <StatCard
          title="RDV aujourd'hui"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          value={rdv.length}
          subtitle="ce mois"
        />
        <StatCard
          title="Disponibles"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          value={vehStats.DISPONIBLE}
          subtitle="véhicules"
        />
        <StatCard
          title="En révision"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          value={vehStats.EN_REVISION}
          subtitle="véhicules"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="content-card p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Ventes</h3>
          <div className="grid grid-cols-2 gap-5">
            {[
              { label: 'Total ventes', value: ventesStats?.totalVentes ?? 0 },
              { label: 'Ventes ce mois', value: ventesStats?.ventesCeMois ?? 0 },
              { label: "Chiffre d'affaires total", value: `${Number(ventesStats?.chiffreAffairesTotal ?? 0).toLocaleString('fr-FR')} MAD` },
              { label: "Chiffre d'affaires ce mois", value: `${Number(ventesStats?.chiffreAffairesCeMois ?? 0).toLocaleString('fr-FR')} MAD` },
              { label: 'Véhicules disponibles', value: vehStats.DISPONIBLE },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-xl font-extrabold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Répartition utilisateurs</h3>
          <div className="space-y-5">
            {['CLIENT', 'COMMERCIAL', 'CHEF_ATELIER', 'ADMIN'].map(role => {
              const count = clients.filter(c => c.role === role).length
              const pct = clients.length ? (count / clients.length * 100) : 0
              return (
                <div key={role}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{role.replace('_', ' ')}</span>
                    <span className="text-sm font-bold text-gray-800">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="bg-accent h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
