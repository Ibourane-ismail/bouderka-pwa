import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'
import StatCard from '../../components/StatCard'

const MODE_PAIEMENT_LABELS = {
  ESPECES: 'Espèces',
  CARTE_BANCAIRE: 'Carte bancaire',
  VIREMENT: 'Virement',
}

const VentesPage = () => {
  const [ventes, setVentes] = useState([])
  const [loading, setLoading] = useState(true)

  const loadVentes = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/ventes', { params: { limit: 200 } })
      setVentes(res.data.data?.ventes || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadVentes() }, [])

  const totalMontant = ventes.reduce((sum, v) => sum + Number(v.prixVente || 0), 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
        <div className="skeleton h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Mes ventes</h1>
        <p className="text-sm text-gray-400 mt-1">Historique des véhicules que vous avez vendus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total ventes"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          value={ventes.length}
          subtitle="véhicules vendus"
        />
        <StatCard
          title="Montant total"
          icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          value={`${totalMontant.toLocaleString('fr-FR')} MAD`}
          subtitle="chiffre d'affaires"
        />
      </div>

      <DataTable
        columns={[
          { key: 'vehicule', label: 'Véhicule', render: (v) => v.vehicule ? `${v.vehicule.marque} ${v.vehicule.modele} (${v.vehicule.annee})` : '—' },
          { key: 'client', label: 'Client', render: (v) => v.client ? `${v.client.prenom} ${v.client.nom}` : '—' },
          { key: 'cinClient', label: 'CIN' },
          { key: 'telephone', label: 'Téléphone' },
          { key: 'prixVente', label: 'Prix', render: (v) => `${Number(v.prixVente).toLocaleString('fr-FR')} MAD` },
          { key: 'modePaiement', label: 'Mode de paiement', render: (v) => MODE_PAIEMENT_LABELS[v.modePaiement] || v.modePaiement },
          { key: 'dateVente', label: 'Date', render: (v) => new Date(v.dateVente).toLocaleDateString('fr-FR', { dateStyle: 'medium' }) },
        ]}
        data={ventes}
        renderMobileCard={(v) => (
          <div key={v.id} className="content-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">{v.vehicule ? `${v.vehicule.marque} ${v.vehicule.modele}` : '—'}</span>
              <span className="text-xs text-gray-400">{new Date(v.dateVente).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</span>
            </div>
            <p className="text-sm text-gray-600">{v.client ? `${v.client.prenom} ${v.client.nom}` : '—'} &bull; CIN {v.cinClient}</p>
            <p className="text-sm text-gray-400">{Number(v.prixVente).toLocaleString('fr-FR')} MAD &bull; {MODE_PAIEMENT_LABELS[v.modePaiement] || v.modePaiement}</p>
          </div>
        )}
      />
    </div>
  )
}

export default VentesPage
