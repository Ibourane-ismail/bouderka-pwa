import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'
import PremiumSelect from '../../components/PremiumSelect'

const TYPES_SERVICE = ['Vidange', 'Révision', 'Contrôle technique', 'Réparation', 'Autre']
const TYPE_SERVICE_OPTIONS = TYPES_SERVICE.map(t => ({ value: t, label: t }))

const emptyForm = {
  clientId: '',
  vehiculeId: '',
  immatriculation: '',
  typeService: 'Vidange',
  description: '',
  kilometrageService: '',
  prochainVideange: '',
  prochainControle: '',
}

const EntretiensPage = () => {
  const [entretiens, setEntretiens] = useState([])
  const [clients, setClients] = useState([])
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [entRes, cliRes, vehRes] = await Promise.all([
        api.get('/api/entretien', { params: { limit: 50 } }),
        api.get('/api/entretien/clients'),
        api.get('/api/vehicules', { params: { limit: 200 } }),
      ])
      setEntretiens(entRes.data.data?.entretiens || [])
      setClients(cliRes.data.data?.clients || [])
      setVehicules(vehRes.data.data?.vehicules || [])
    } catch (err) {
      console.error(err)
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const clientOptions = clients.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom} — ${c.email}` }))
  const vehiculeOptions = [
    { value: '', label: 'Aucun véhicule spécifique' },
    ...vehicules.map(v => ({ value: v.id, label: `${v.marque} ${v.modele} (${v.annee})` })),
  ]

  const handleChange = (name, value) => setForm(prev => ({ ...prev, [name]: value }))

  const openForm = () => {
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Le service est enregistré le jour même (le client vient d'amener sa voiture)
      await api.post('/api/entretien', {
        clientId: form.clientId,
        vehiculeId: form.vehiculeId || undefined,
        immatriculation: form.immatriculation,
        typeService: form.typeService,
        description: form.description,
        dateService: new Date().toISOString(),
        kilometrageService: Number(form.kilometrageService),
        prochainVideange: Number(form.prochainVideange),
        prochainControle: form.prochainControle ? new Date(form.prochainControle).toISOString() : undefined,
      })
      toast.success('Entretien enregistré')
      setShowForm(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement")
    } finally {
      setSubmitting(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Entretiens</h1>
          <p className="text-sm text-gray-400 mt-1">Enregistrer un entretien pour un client</p>
        </div>
        <button onClick={openForm} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvel entretien
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'client', label: 'Client', render: (e) => `${e.client?.prenom} ${e.client?.nom}` },
          { key: 'vehicule', label: 'Véhicule', render: (e) => e.vehicule ? `${e.vehicule.marque} ${e.vehicule.modele}` : '—' },
          { key: 'typeService', label: 'Type' },
          { key: 'date', label: 'Date', render: (e) => new Date(e.dateService).toLocaleDateString('fr-FR', { dateStyle: 'medium' }) },
          { key: 'km', label: 'Kilométrage', render: (e) => `${Number(e.kilometrageService).toLocaleString('fr-FR')} km` },
        ]}
        data={entretiens}
        renderMobileCard={(e) => (
          <div key={e.id} className="content-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">{e.client?.prenom} {e.client?.nom}</span>
              <span className="text-xs text-gray-400">{new Date(e.dateService).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</span>
            </div>
            <p className="text-sm text-gray-600">{e.vehicule ? `${e.vehicule.marque} ${e.vehicule.modele}` : 'Véhicule non précisé'}</p>
            <p className="text-sm text-gray-400">{e.typeService} — {Number(e.kilometrageService).toLocaleString('fr-FR')} km</p>
          </div>
        )}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="content-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nouvel entretien</h2>
                <button onClick={() => setShowForm(false)} className="btn-ghost p-1" aria-label="Fermer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <PremiumSelect
                  label="Client"
                  value={form.clientId}
                  onChange={(v) => handleChange('clientId', v)}
                  options={clientOptions}
                  placeholder="Sélectionner un client"
                  required
                />

                <PremiumSelect
                  label="Véhicule (optionnel)"
                  value={form.vehiculeId}
                  onChange={(v) => handleChange('vehiculeId', v)}
                  options={vehiculeOptions}
                  placeholder="Sélectionner un véhicule"
                />

                <div>
                  <label className="form-label">Immatriculation</label>
                  <input
                    type="text"
                    value={form.immatriculation}
                    onChange={(e) => handleChange('immatriculation', e.target.value)}
                    required
                    className="form-input"
                    placeholder="Ex: 12345-A-6"
                  />
                </div>

                <PremiumSelect
                  label="Type de service"
                  value={form.typeService}
                  onChange={(v) => handleChange('typeService', v)}
                  options={TYPE_SERVICE_OPTIONS}
                  required
                />

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    required
                    rows={3}
                    className="form-input"
                    placeholder="Ex: Vidange + filtre à huile et filtre à air"
                  />
                </div>

                <div>
                  <label className="form-label">Kilométrage actuel</label>
                  <input
                    type="number"
                    value={form.kilometrageService}
                    onChange={(e) => handleChange('kilometrageService', e.target.value)}
                    required
                    min="0"
                    className="form-input"
                    placeholder="Ex: 45000"
                  />
                </div>

                <div>
                  <label className="form-label">Prochaine vidange dans (km)</label>
                  <input
                    type="number"
                    value={form.prochainVideange}
                    onChange={(e) => handleChange('prochainVideange', e.target.value)}
                    required
                    min="0"
                    className="form-input"
                    placeholder="Ex: 10000"
                  />
                </div>

                <div>
                  <label className="form-label">Prochain contrôle technique (optionnel)</label>
                  <input
                    type="date"
                    value={form.prochainControle}
                    onChange={(e) => handleChange('prochainControle', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Annuler</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EntretiensPage
