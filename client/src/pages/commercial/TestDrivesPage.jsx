import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import StatutBadge from '../../components/StatutBadge'
import DataTable from '../../components/DataTable'

const TestDrivesPage = () => {
  const [testDrives, setTestDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState(null)

  const fetchTestDrives = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/testdrive', { params: { limit: 200 } })
      setTestDrives(res.data.data.testDrives || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTestDrives() }, [])

  const handleStatut = async (id, statut) => {
    try {
      await api.put(`/api/testdrive/${id}/statut`, { statut })
      toast.success(statut === 'APPROUVE' ? 'Test drive approuvé' : 'Test drive refusé')
      setConfirmAction(null)
      fetchTestDrives()
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
      <h1 className="section-title">Demandes de test drive</h1>

      <DataTable
        columns={[
          {
            key: 'client', label: 'Client',
            render: (td) => (
              <div>
                <p className="font-medium text-gray-900">{td.client?.prenom} {td.client?.nom}</p>
                <p className="text-xs text-gray-400">{td.client?.email}</p>
              </div>
            ),
          },
          { key: 'vehicule', label: 'Véhicule', render: (td) => `${td.vehicule?.marque} ${td.vehicule?.modele} (${td.vehicule?.annee})` },
          { key: 'date', label: 'Date souhaitée', render: (td) => new Date(td.dateHeure).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) },
          { key: 'statut', label: 'Statut', render: (td) => <StatutBadge statut={td.statut} /> },
          {
            key: 'actions', label: 'Actions',
            className: 'text-right',
            render: (td) => td.statut === 'EN_ATTENTE' ? (
              confirmAction?.id === td.id ? (
                <div className="flex justify-end gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleStatut(td.id, confirmAction.action) }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      confirmAction.action === 'APPROUVE'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}>
                    Confirmer
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmAction(null) }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    Annuler
                  </button>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ id: td.id, action: 'APPROUVE' }) }}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors">
                    Approuver
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ id: td.id, action: 'REFUSE' }) }}
                    className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">
                    Refuser
                  </button>
                </div>
              )
            ) : <span className="text-gray-300 text-xs">—</span>,
          },
        ]}
        data={testDrives}
        renderMobileCard={(td) => (
          <div key={td.id} className="content-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">{td.client?.prenom} {td.client?.nom}</span>
              <StatutBadge statut={td.statut} />
            </div>
            <p className="text-sm text-gray-600">{td.vehicule?.marque} {td.vehicule?.modele}</p>
            <p className="text-sm text-gray-400">{new Date(td.dateHeure).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
            {td.statut === 'EN_ATTENTE' && (
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setConfirmAction({ id: td.id, action: 'APPROUVE' }); handleStatut(td.id, 'APPROUVE') }}
                  className="btn-primary flex-1 py-1.5 text-xs">Approuver</button>
                <button onClick={() => { setConfirmAction({ id: td.id, action: 'REFUSE' }); handleStatut(td.id, 'REFUSE') }}
                  className="flex-1 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">Refuser</button>
              </div>
            )}
          </div>
        )}
      />
    </div>
  )
}

export default TestDrivesPage
