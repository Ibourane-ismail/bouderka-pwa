import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import StatutBadge from '../../components/StatutBadge'
import DataTable from '../../components/DataTable'

const STATUTS = ['DISPONIBLE', 'EN_REVISION', 'VENDU']

const VehiculesPage = () => {
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchVehicules = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/vehicules', { params: { statut: 'EN_REVISION', limit: 200 } })
      setVehicules(res.data.data.vehicules || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVehicules() }, [])

  const handleStatutChange = async (id, newStatut) => {
    try {
      await api.put(`/api/vehicules/${id}`, { statut: newStatut })
      toast.success('Statut mis à jour')
      setVehicules(prev => prev.map(v => v.id === id ? { ...v, statut: newStatut } : v).filter(v => v.statut === 'EN_REVISION'))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="skeleton h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Véhicules en atelier</h1>
        <p className="text-sm text-gray-400 mt-1">Gérez les véhicules en révision</p>
      </div>

      <DataTable
        columns={[
          { key: 'marque', label: 'Marque', render: (v) => <span className="font-semibold">{v.marque}</span> },
          { key: 'modele', label: 'Modèle' },
          { key: 'annee', label: 'Année' },
          { key: 'km', label: 'Kilométrage', render: (v) => `${v.kilometrage?.toLocaleString('fr-FR')} km` },
          { key: 'statut', label: 'Statut', render: (v) => <StatutBadge statut={v.statut} /> },
          {
            key: 'actions', label: 'Changer statut',
            render: (v) => (
              <select value={v.statut} onChange={(e) => handleStatutChange(v.id, e.target.value)}
                className="form-select text-xs py-1.5 px-3 w-auto min-w-[130px]">
                {STATUTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            ),
          },
        ]}
        data={vehicules}
        renderMobileCard={(v) => (
          <div key={v.id} className="content-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">{v.marque} {v.modele}</span>
              <StatutBadge statut={v.statut} />
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{v.annee}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{v.kilometrage?.toLocaleString('fr-FR')} km</span>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Changer statut</label>
              <select value={v.statut} onChange={(e) => handleStatutChange(v.id, e.target.value)}
                className="form-select text-xs py-1.5 w-full">
                {STATUTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
        )}
      />
    </div>
  )
}

export default VehiculesPage
