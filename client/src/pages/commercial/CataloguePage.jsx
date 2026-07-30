import { useState, useEffect, useMemo } from 'react'
import { Loader, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Logo from '../../components/Logo'
import PremiumSelect from '../../components/PremiumSelect'

const MODES_PAIEMENT_OPTIONS = [
  { value: 'ESPECES', label: 'Espèces' },
  { value: 'CARTE_BANCAIRE', label: 'Carte bancaire' },
  { value: 'VIREMENT', label: 'Virement' },
]

const todayISO = () => new Date().toISOString().slice(0, 10)

const emptyForm = {
  clientId: '',
  telephone: '',
  cinClient: '',
  dateVente: todayISO(),
  prixVente: '',
  modePaiement: 'ESPECES',
  notes: '',
}

const priceLabel = (v) => (v ? `${Number(v).toLocaleString('fr-FR')} MAD` : '—')

const CataloguePage = () => {
  const [tab, setTab] = useState('catalogue')
  const [vehicules, setVehicules] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [venteVehicule, setVenteVehicule] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [vehRes, cliRes] = await Promise.all([
        api.get('/api/vehicules', { params: { limit: 200 } }),
        api.get('/api/ventes/clients'),
      ])
      setVehicules(vehRes.data.data?.vehicules || [])
      setClients(cliRes.data.data?.clients || [])
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur de chargement'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const vehiculesDisponibles = useMemo(
    () => vehicules.filter(v => v.statut === 'DISPONIBLE'),
    [vehicules]
  )

  const clientOptions = clients.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom} — ${c.email}` }))

  const openVenteModal = (vehicule) => {
    setVenteVehicule(vehicule)
    setForm({ ...emptyForm, prixVente: vehicule.prix || '' })
  }

  const closeVenteModal = () => {
    setVenteVehicule(null)
    setForm(emptyForm)
  }

  const handleChange = (name, value) => setForm(prev => ({ ...prev, [name]: value }))

  const handleClientChange = (clientId) => {
    const client = clients.find(c => c.id === clientId)
    setForm(prev => ({ ...prev, clientId, telephone: client?.telephone || prev.telephone }))
  }

  const submitVente = async (e) => {
    e.preventDefault()
    if (!venteVehicule) return
    setSubmitting(true)
    try {
      await api.post('/api/ventes', {
        vehiculeId: venteVehicule.id,
        clientId: form.clientId,
        cinClient: form.cinClient,
        telephone: form.telephone,
        dateVente: new Date(form.dateVente).toISOString(),
        prixVente: Number(form.prixVente),
        modePaiement: form.modePaiement,
        notes: form.notes || undefined,
      })
      toast.success('Vente enregistrée avec succès')
      closeVenteModal()
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement de la vente")
    } finally {
      setSubmitting(false)
    }
  }

  const renderVehiculeCard = (v, { withVenteButton } = {}) => (
    <div key={v.id} className="vehicle-card overflow-hidden">
      <div className="aspect-[16/10] bg-gray-100 flex items-center justify-center overflow-hidden">
        {v.images && v.images.length > 0 ? (
          <img src={v.images[0]} alt={`${v.marque} ${v.modele}`} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl font-black text-gray-200">{v.marque}</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-1">
          <Logo type={v.marque?.toLowerCase()} className="h-5 w-5" />
          {v.marque} {v.modele}
        </h3>
        <div className="text-sm text-gray-600 mb-3">
          {v.annee} &bull; {priceLabel(v.prix)}
        </div>
        {withVenteButton && (
          <button onClick={() => openVenteModal(v)} className="btn-primary w-full py-1.5 text-sm">
            Enregistrer une vente
          </button>
        )}
      </div>
    </div>
  )

  const renderEmpty = (text) => (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="empty-state-title">Aucun véhicule</h3>
      <p className="empty-state-text">{text}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Catalogue</h1>
        <p className="text-sm text-gray-400 mt-1">Parcourir les véhicules et enregistrer une vente</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('catalogue')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'catalogue' ? 'border-[#CC0000] text-[#CC0000]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Catalogue
        </button>
        <button
          onClick={() => setTab('ventes')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'ventes' ? 'border-[#CC0000] text-[#CC0000]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Ventes
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-accent mr-2" size={24} />
          <span className="text-gray-600">Chargement...</span>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Erreur</h3>
            <p className="text-red-800 text-sm">{error}</p>
            <button onClick={loadData} className="mt-2 text-sm text-red-700 underline hover:no-underline">Réessayer</button>
          </div>
        </div>
      )}

      {!loading && !error && tab === 'catalogue' && (
        vehicules.length === 0 ? renderEmpty('Aucun véhicule au catalogue pour le moment.') : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicules.map(v => renderVehiculeCard(v))}
          </div>
        )
      )}

      {!loading && !error && tab === 'ventes' && (
        vehiculesDisponibles.length === 0 ? renderEmpty('Aucun véhicule disponible à la vente actuellement.') : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehiculesDisponibles.map(v => renderVehiculeCard(v, { withVenteButton: true }))}
          </div>
        )
      )}

      {venteVehicule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="content-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Enregistrer une vente</h2>
                <button onClick={closeVenteModal} className="btn-ghost p-1" aria-label="Fermer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={submitVente} className="space-y-5">
                <div>
                  <label className="form-label">Véhicule</label>
                  <div className="form-input bg-gray-50 text-gray-600 flex items-center gap-2">
                    <Logo type={venteVehicule.marque?.toLowerCase()} className="h-4 w-4" />
                    {venteVehicule.marque} {venteVehicule.modele} ({venteVehicule.annee})
                  </div>
                </div>

                <PremiumSelect
                  label="Client"
                  value={form.clientId}
                  onChange={handleClientChange}
                  options={clientOptions}
                  placeholder="Sélectionner un client"
                  required
                />

                <div>
                  <label className="form-label">Téléphone client</label>
                  <input
                    type="text"
                    value={form.telephone}
                    onChange={(e) => handleChange('telephone', e.target.value)}
                    required
                    className="form-input"
                    placeholder="Ex: 0612345678"
                  />
                </div>

                <div>
                  <label className="form-label">CIN client</label>
                  <input
                    type="text"
                    value={form.cinClient}
                    onChange={(e) => handleChange('cinClient', e.target.value)}
                    required
                    className="form-input"
                    placeholder="Ex: AB123456"
                  />
                </div>

                <div>
                  <label className="form-label">Date de vente</label>
                  <input
                    type="date"
                    value={form.dateVente}
                    onChange={(e) => handleChange('dateVente', e.target.value)}
                    required
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Prix de vente final (MAD)</label>
                  <input
                    type="number"
                    value={form.prixVente}
                    onChange={(e) => handleChange('prixVente', e.target.value)}
                    required
                    min="0"
                    className="form-input"
                  />
                </div>

                <PremiumSelect
                  label="Mode de paiement"
                  value={form.modePaiement}
                  onChange={(v) => handleChange('modePaiement', v)}
                  options={MODES_PAIEMENT_OPTIONS}
                  required
                />

                <div>
                  <label className="form-label">Notes (optionnel)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    className="form-input"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Enregistrement...' : 'Enregistrer la vente'}
                  </button>
                  <button type="button" onClick={closeVenteModal} className="btn-outline">Annuler</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CataloguePage
