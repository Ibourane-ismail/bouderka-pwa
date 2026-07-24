import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, Loader, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Logo from '../../components/Logo'
import PremiumSelect from '../../components/PremiumSelect'

const MARQUES = ['VOLKSWAGEN', 'AUDI', 'SKODA', 'PORSCHE']
const MARQUE_OPTIONS = MARQUES.map(m => ({ value: m, label: m.charAt(0) + m.slice(1).toLowerCase(), icon: <Logo type={m.toLowerCase()} className="h-4 w-4" /> }))
const CARBURANTS = ['Essence', 'Diesel', 'Hybride', 'Électrique']
const CARBURANT_OPTIONS = CARBURANTS.map(c => ({ value: c, label: c }))
const TRANSMISSIONS = ['Manuelle', 'Automatique']
const TRANSMISSION_OPTIONS = TRANSMISSIONS.map(t => ({ value: t, label: t }))
const DISPONIBILITES = ['Disponible', 'En commande', 'Rupture de stock', 'Bientôt disponible']

const SUGGESTED_OPTIONS = [
  'GPS', 'Apple CarPlay', 'Android Auto', 'Bluetooth', 'Caméra de recul',
  'Radar avant', 'Radar arrière', 'Jantes alliage', 'Climatisation automatique',
  'Toit panoramique', 'Sièges chauffants', 'Volant chauffant',
  'Phares LED', 'Direction assistée', 'Vitres électriques', 'Verrouillage centralisé',
  'Rétroviseurs rabattables', 'Sellerie cuir', 'Hayon électrique',
  'Régulateur de vitesse', 'Limiteur de vitesse', 'Aide au stationnement',
  'Caméra 360°', 'Affichage tête haute', 'Son Harman Kardon', 'Son Bose',
  'Porte-bagages', "Crochet d'attelage", 'Pack chrome', 'Pack S-Line',
  'Pack AMG', 'Pack R-Line', 'Finition sport', 'Suspension sport',
]

const emptyForm = {
  marque: 'VOLKSWAGEN',
  modele: '',
  version: '',
  finition: '',
  annee: '',
  prix: '',
  prixPromo: '',
  carburant: 'Essence',
  transmission: 'Manuelle',
  description: '',
}

const normalizeOptions = (options) =>
  Array.isArray(options) ? options.map(o => (typeof o === 'string' ? o : o.nom || o.name || o.label || '')).filter(Boolean) : []

const normalizeCouleurs = (couleurs) =>
  Array.isArray(couleurs)
    ? couleurs.map(c => (typeof c === 'string' ? { hex: c, nom: '' } : { hex: c.hex || c.couleur || '', nom: c.nom || c.name || '' }))
    : []

export default function MediaPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Modal création / édition des informations de base
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Champs de saisie pour la gestion média (détail véhicule)
  const [versionDraft, setVersionDraft] = useState('')
  const [finitionDraft, setFinitionDraft] = useState('')
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newOption, setNewOption] = useState('')
  const [showEquipSuggestions, setShowEquipSuggestions] = useState(false)
  const [newCouleurHex, setNewCouleurHex] = useState('#000000')
  const [newCouleurNom, setNewCouleurNom] = useState('')

  const selectedVehicle = useMemo(
    () => vehicles.find(v => v.id === selectedId) || null,
    [vehicles, selectedId]
  )

  useEffect(() => {
    loadVehicles()
  }, [])

  // Resynchronise les champs de saisie uniquement quand on change de véhicule sélectionné
  useEffect(() => {
    setVersionDraft(selectedVehicle?.version || '')
    setFinitionDraft(selectedVehicle?.finition || '')
    setNewPhotoUrl('')
    setNewOption('')
    setShowEquipSuggestions(false)
    setNewCouleurHex('#000000')
    setNewCouleurNom('')
    setDeleteConfirm(null)
  }, [selectedId])

  const loadVehicles = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/vehicules', { params: { limit: 200 } })
      setVehicles(res.data.data?.vehicules || [])
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur de chargement'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Applique une modification partielle au véhicule sélectionné et met à jour la liste
  // depuis la réponse confirmée du serveur (source de vérité unique, pas de mise à jour optimiste).
  const patchSelected = async (payload) => {
    if (!selectedId) return null
    setSaving(true)
    try {
      const res = await api.put(`/api/vehicules/${selectedId}`, payload)
      const updated = res.data.data.vehicule
      setVehicles(prev => prev.map(v => (v.id === updated.id ? updated : v)))
      toast.success('Enregistré')
      return updated
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
      return null
    } finally {
      setSaving(false)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowFormModal(true)
  }

  const openEdit = (v) => {
    setEditingId(v.id)
    setForm({
      marque: v.marque,
      modele: v.modele,
      version: v.version || '',
      finition: v.finition || '',
      annee: v.annee,
      prix: v.prix,
      prixPromo: v.prixPromo || '',
      carburant: v.carburant,
      transmission: v.transmission,
      description: v.description || '',
    })
    setShowFormModal(true)
  }

  const handleFormChange = (name, value) => setForm(prev => ({ ...prev, [name]: value }))

  const submitForm = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        marque: form.marque,
        modele: form.modele,
        version: form.version || null,
        finition: form.finition || null,
        annee: Number(form.annee),
        prix: Number(form.prix),
        prixPromo: form.prixPromo ? Number(form.prixPromo) : null,
        carburant: form.carburant,
        transmission: form.transmission,
        description: form.description || '',
      }

      if (editingId) {
        const res = await api.put(`/api/vehicules/${editingId}`, payload)
        const updated = res.data.data.vehicule
        setVehicles(prev => prev.map(v => (v.id === updated.id ? updated : v)))
        toast.success('Véhicule modifié')
      } else {
        const res = await api.post('/api/vehicules', payload)
        const created = res.data.data.vehicule
        setVehicles(prev => [created, ...prev])
        toast.success('Véhicule ajouté')
      }
      setShowFormModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/vehicules/${id}`)
      setVehicles(prev => prev.filter(v => v.id !== id))
      if (selectedId === id) setSelectedId(null)
      setDeleteConfirm(null)
      toast.success('Véhicule supprimé')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de suppression')
    }
  }

  // --- Photos / galerie ---
  const addPhoto = async () => {
    if (!newPhotoUrl.trim() || !selectedVehicle) return
    const updated = [...(selectedVehicle.images || []), newPhotoUrl.trim()]
    const saved = await patchSelected({ images: updated })
    if (saved) setNewPhotoUrl('')
  }

  const removePhoto = async (index) => {
    if (!selectedVehicle) return
    const updated = (selectedVehicle.images || []).filter((_, i) => i !== index)
    await patchSelected({ images: updated })
  }

  const movePhoto = async (index, direction) => {
    if (!selectedVehicle) return
    const images = [...(selectedVehicle.images || [])]
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= images.length) return
    ;[images[index], images[newIndex]] = [images[newIndex], images[index]]
    await patchSelected({ images })
  }

  const setMainPhoto = async (index) => {
    if (!selectedVehicle) return
    const images = [...(selectedVehicle.images || [])]
    const [chosen] = images.splice(index, 1)
    images.unshift(chosen)
    await patchSelected({ images })
  }

  // --- Couleurs ---
  const addCouleur = async () => {
    if (!newCouleurHex || !selectedVehicle) return
    const updated = [...normalizeCouleurs(selectedVehicle.couleurs), { hex: newCouleurHex, nom: newCouleurNom }]
    const saved = await patchSelected({ couleurs: updated })
    if (saved) { setNewCouleurNom(''); setNewCouleurHex('#000000') }
  }

  const removeCouleur = async (index) => {
    if (!selectedVehicle) return
    const updated = normalizeCouleurs(selectedVehicle.couleurs).filter((_, i) => i !== index)
    await patchSelected({ couleurs: updated })
  }

  // --- Équipements ---
  const addOption = async () => {
    const value = newOption.trim()
    if (!value || !selectedVehicle) return
    const current = normalizeOptions(selectedVehicle.options)
    if (current.includes(value)) {
      toast.error('Cet équipement existe déjà')
      return
    }
    const updated = [...current, value]
    const saved = await patchSelected({ options: updated })
    if (saved) { setNewOption(''); setShowEquipSuggestions(false) }
  }

  const removeOption = async (index) => {
    if (!selectedVehicle) return
    const updated = normalizeOptions(selectedVehicle.options).filter((_, i) => i !== index)
    await patchSelected({ options: updated })
  }

  // --- Version / finition / disponibilité ---
  const saveVersionFinition = async () => {
    await patchSelected({ version: versionDraft || null, finition: finitionDraft || null })
  }

  const saveDisponibilite = async (val) => {
    await patchSelected({ disponibilite: val })
  }

  const filteredSuggestions = SUGGESTED_OPTIONS.filter(
    s => s.toLowerCase().includes(newOption.toLowerCase()) && !normalizeOptions(selectedVehicle?.options).includes(s)
  )

  const renderFormModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="content-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h2>
            <button onClick={() => setShowFormModal(false)} className="btn-ghost p-1" aria-label="Fermer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={submitForm} className="space-y-5">
            <PremiumSelect label="Marque" value={form.marque} onChange={(v) => handleFormChange('marque', v)} options={MARQUE_OPTIONS} required />

            <div>
              <label className="form-label">Modèle</label>
              <input type="text" value={form.modele} onChange={(e) => handleFormChange('modele', e.target.value)} required className="form-input" />
            </div>

            <div>
              <label className="form-label">Version</label>
              <input type="text" value={form.version} onChange={(e) => handleFormChange('version', e.target.value)} placeholder="Ex: GTI, S-Line, Style..." className="form-input" />
            </div>

            <div>
              <label className="form-label">Finition</label>
              <input type="text" value={form.finition} onChange={(e) => handleFormChange('finition', e.target.value)} placeholder="Ex: Pack, Luxe, Sport..." className="form-input" />
            </div>

            <div>
              <label className="form-label">Année</label>
              <input type="number" value={form.annee} onChange={(e) => handleFormChange('annee', e.target.value)} required min="1900" className="form-input" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Prix (MAD)</label>
                <input type="number" value={form.prix} onChange={(e) => handleFormChange('prix', e.target.value)} required min="0" className="form-input" />
              </div>
              <div>
                <label className="form-label">Prix promo (MAD)</label>
                <input type="number" value={form.prixPromo} onChange={(e) => handleFormChange('prixPromo', e.target.value)} min="0" className="form-input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <PremiumSelect label="Carburant" value={form.carburant} onChange={(v) => handleFormChange('carburant', v)} options={CARBURANT_OPTIONS} required />
              <PremiumSelect label="Transmission" value={form.transmission} onChange={(v) => handleFormChange('transmission', v)} options={TRANSMISSION_OPTIONS} required />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea value={form.description} onChange={(e) => handleFormChange('description', e.target.value)} rows={3} className="form-input" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Enregistrement...' : editingId ? 'Modifier' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => setShowFormModal(false)} className="btn-outline">Annuler</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  // Vue: Liste des véhicules
  if (!selectedVehicle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="section-title">Gestion des véhicules</h1>
          <button onClick={openCreate} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un véhicule
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-accent mr-2" size={24} />
            <span className="text-gray-600">Chargement des véhicules...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Erreur</h3>
              <p className="text-red-800 text-sm">{error}</p>
              <button onClick={loadVehicles} className="mt-2 text-sm text-red-700 underline hover:no-underline">
                Réessayer
              </button>
            </div>
          </div>
        )}

        {!loading && vehicles.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="empty-state-title">Aucun véhicule</h3>
            <p className="empty-state-text">Ajoutez un premier véhicule pour commencer</p>
          </div>
        )}

        {!loading && vehicles.length > 0 && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="vehicle-card group overflow-hidden">
                <div
                  onClick={() => setSelectedId(v.id)}
                  className="aspect-[16/10] bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  {v.images && v.images.length > 0 ? (
                    <img
                      src={v.images[0]}
                      alt={`${v.marque} ${v.modele}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-4xl font-black text-gray-200">{v.marque}</span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Logo type={v.marque?.toLowerCase()} className="h-5 w-5" />
                      {v.marque} {v.modele}
                    </h3>
                    {v.disponibilite && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          v.disponibilite === 'Disponible'
                            ? 'bg-emerald-50 text-emerald-700'
                            : v.disponibilite === 'En commande'
                            ? 'bg-amber-50 text-amber-700'
                            : v.disponibilite === 'Rupture de stock'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {v.disponibilite}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-1">
                    {v.annee} &bull; {v.prix ? Number(v.prix).toLocaleString('fr-FR') : '—'} MAD
                  </div>

                  <div className="text-xs text-gray-400 mb-3">
                    {(v.images || []).length} photo{(v.images || []).length !== 1 ? 's' : ''} &bull; {normalizeOptions(v.options).length} équipement{normalizeOptions(v.options).length !== 1 ? 's' : ''}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <button onClick={() => setSelectedId(v.id)} className="btn-outline flex-1 py-1.5 text-xs">
                      Gérer
                    </button>
                    <button onClick={() => openEdit(v)} className="btn-outline flex-1 py-1.5 text-xs">
                      Modifier
                    </button>
                    {deleteConfirm === v.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(v.id)} className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-100 transition-colors">Confirmer</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">Annuler</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(v.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showFormModal && renderFormModal()}
      </div>
    )
  }

  const photos = selectedVehicle.images || []
  const couleurs = normalizeCouleurs(selectedVehicle.couleurs)
  const options = normalizeOptions(selectedVehicle.options)
  const disponibilite = selectedVehicle.disponibilite || 'Disponible'

  // Vue: Détail / gestion complète du véhicule
  return (
    <div className="space-y-6">
      <button onClick={() => setSelectedId(null)} className="btn-ghost pl-0 flex items-center gap-2">
        <ChevronLeft size={18} />
        Retour à la liste
      </button>

      <div className="content-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo type={selectedVehicle.marque?.toLowerCase()} className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedVehicle.marque} {selectedVehicle.modele}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {selectedVehicle.annee} &bull;{' '}
                {selectedVehicle.prix ? Number(selectedVehicle.prix).toLocaleString('fr-FR') : '—'} MAD
                {selectedVehicle.carburant ? ` · ${selectedVehicle.carburant}` : ''}
                {selectedVehicle.transmission ? ` · ${selectedVehicle.transmission}` : ''}
              </p>
            </div>
          </div>
          <button onClick={() => openEdit(selectedVehicle)} className="btn-outline">
            Modifier les informations
          </button>
        </div>
      </div>

      <div className="content-card p-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Disponibilité</h3>
        <div className="flex flex-wrap gap-2">
          {DISPONIBILITES.map(d => (
            <button
              key={d}
              onClick={() => saveDisponibilite(d)}
              disabled={saving}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                disponibilite === d
                  ? 'bg-accent text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="content-card p-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Version / Finition</h3>
        <div className="flex flex-col gap-3">
          <input type="text" value={versionDraft} onChange={(e) => setVersionDraft(e.target.value)} placeholder="Version (Ex: GTI, S-Line, Style...)" className="form-input" />
          <input type="text" value={finitionDraft} onChange={(e) => setFinitionDraft(e.target.value)} placeholder="Finition (Ex: Pack, Luxe, Sport...)" className="form-input" />
          <button onClick={saveVersionFinition} disabled={saving} className="btn-primary self-start">Enregistrer</button>
        </div>
      </div>

      <div className="content-card p-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Photos ({photos.length})</h3>
        <div className="flex gap-3 mb-6">
          <input
            type="url"
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            placeholder="URL de l'image (https://...)"
            className="form-input flex-1"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPhoto() } }}
          />
          <button onClick={addPhoto} disabled={!newPhotoUrl.trim() || saving} className="btn-primary">+ Ajouter</button>
        </div>
        {photos.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">Aucune photo. Ajoutez une URL d'image ci-dessus.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, i) => (
              <div key={`${photo}-${i}`} className={`relative rounded-xl overflow-hidden border-2 transition-colors ${i === 0 ? 'border-accent' : 'border-gray-100'}`}>
                <div className="aspect-[4/3] bg-gray-100">
                  <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                </div>
                {i === 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 bg-accent text-white text-[10px] font-bold rounded-md">PRINCIPALE</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 gap-2">
                  {i !== 0 && (
                    <button onClick={() => setMainPhoto(i)} disabled={saving} className="w-7 h-7 bg-white rounded-lg text-xs font-bold shadow hover:bg-gray-100 flex items-center justify-center" title="Définir comme principale">★</button>
                  )}
                  {i > 0 && (
                    <button onClick={() => movePhoto(i, -1)} disabled={saving} className="w-7 h-7 bg-white rounded-lg text-xs shadow hover:bg-gray-100 flex items-center justify-center" title="Déplacer à gauche">←</button>
                  )}
                  {i < photos.length - 1 && (
                    <button onClick={() => movePhoto(i, 1)} disabled={saving} className="w-7 h-7 bg-white rounded-lg text-xs shadow hover:bg-gray-100 flex items-center justify-center" title="Déplacer à droite">→</button>
                  )}
                  <button onClick={() => removePhoto(i)} disabled={saving} className="w-7 h-7 bg-red-600 text-white rounded-lg text-xs shadow hover:bg-red-700 flex items-center justify-center" title="Supprimer">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="content-card p-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Couleurs disponibles</h3>
        <div className="flex gap-3 mb-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Couleur</label>
            <input type="color" value={newCouleurHex} onChange={(e) => setNewCouleurHex(e.target.value)} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
            <input type="text" value={newCouleurNom} onChange={(e) => setNewCouleurNom(e.target.value)} placeholder="Ex: Noir Météorite, Blanc..." className="form-input" />
          </div>
          <button onClick={addCouleur} disabled={saving} className="btn-primary">+ Ajouter</button>
        </div>
        {couleurs.length === 0 ? (
          <p className="text-gray-400 text-sm py-2">Aucune couleur définie.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {couleurs.map((c, i) => (
              <div key={`${c.hex}-${i}`} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} />
                <span className="text-sm font-medium text-gray-700">{c.nom || c.hex}</span>
                <button onClick={() => removeCouleur(i)} disabled={saving} className="btn-ghost p-0.5 text-gray-400 hover:text-red-500">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="content-card p-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Équipements ({options.length})</h3>
        <div className="relative mb-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newOption}
              onChange={(e) => { setNewOption(e.target.value); setShowEquipSuggestions(true) }}
              onFocus={() => setShowEquipSuggestions(true)}
              placeholder="Ajouter un équipement..."
              className="form-input flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption() } }}
            />
            <button onClick={addOption} disabled={!newOption.trim() || saving} className="btn-primary">+ Ajouter</button>
          </div>
          {showEquipSuggestions && newOption && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-[90px] mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.slice(0, 10).map(s => (
                <button key={s} onClick={() => { setNewOption(s); setShowEquipSuggestions(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">{s}</button>
              ))}
            </div>
          )}
        </div>
        {options.length === 0 ? (
          <p className="text-gray-400 text-sm py-2">Aucun équipement ajouté.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {options.map((opt, i) => (
              <span key={`${opt}-${i}`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-full border border-gray-100">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {opt}
                <button onClick={() => removeOption(i)} disabled={saving} className="btn-ghost p-0.5 text-gray-400 hover:text-red-500">✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {showFormModal && renderFormModal()}
    </div>
  )
}
