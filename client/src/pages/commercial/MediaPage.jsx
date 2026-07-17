import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const SUGGESTED_OPTIONS = [
  'GPS', 'Apple CarPlay', 'Android Auto', 'Bluetooth', 'Caméra de recul',
  'Radar avant', 'Radar arrière', 'Jantes alliage', 'Climatisation automatique',
  'Toit panoramique', 'Sièges chauffants', 'Volant chauffant', 'Feeux LED',
  'Phares LED', 'Direction assistée', 'Vitres électriques', 'Verrouillage centralisé',
  'Rétroviseurs rabattables', 'Sellerie cuir', 'Hayon électrique',
  'Régulateur de vitesse', 'Limiteur de vitesse', 'Aide au stationnement',
  'Caméra 360°', 'Affichage tête haute', 'Son Harman Kardon', 'Son Bose',
  'Porte-bagages', "Crochet d'attelage", 'Pack chrome', 'Pack S-Line',
  'Pack AMG', 'Pack R-Line', 'Finition sport', 'Suspension sport',
]

const MediaPage = () => {
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicule, setSelectedVehicule] = useState(null)
  const [updating, setUpdating] = useState(false)

  const [photos, setPhotos] = useState([])
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0)
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [options, setOptions] = useState([])
  const [newOption, setNewOption] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [couleurs, setCouleurs] = useState([])
  const [newCouleurHex, setNewCouleurHex] = useState('#000000')
  const [newCouleurNom, setNewCouleurNom] = useState('')
  const [version, setVersion] = useState('')
  const [disponibilite, setDisponibilite] = useState('Disponible')

  const fetchVehicules = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/vehicules', { params: { limit: 200 } })
      setVehicules(res.data.data?.vehicules || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVehicules() }, [])

  const selectVehicule = (v) => {
    setSelectedVehicule(v)
    setPhotos(Array.isArray(v.images) ? [...v.images] : [])
    setMainPhotoIndex(0)
    setOptions(Array.isArray(v.options) ? v.options.map(o => typeof o === 'string' ? o : o.nom || o.name || o.label || '').filter(Boolean) : [])
    setCouleurs(Array.isArray(v.couleurs) ? v.couleurs.map(c => typeof c === 'string' ? { hex: c, nom: '' } : { hex: c.hex || c.couleur || '', nom: c.nom || c.name || '' }) : [])
    setVersion(v.version || '')
    setDisponibilite(v.disponibilite || 'Disponible')
    setNewPhotoUrl('')
    setNewOption('')
    setShowSuggestions(false)
  }

  const addPhoto = async () => {
    if (!newPhotoUrl.trim() || !selectedVehicule) return
    const updated = [...photos, newPhotoUrl.trim()]
    setPhotos(updated)
    setNewPhotoUrl('')
    await saveVehicleData({ images: updated })
  }

  const removePhoto = async (index) => {
    const updated = photos.filter((_, i) => i !== index)
    if (mainPhotoIndex >= updated.length) setMainPhotoIndex(Math.max(0, updated.length - 1))
    setPhotos(updated)
    await saveVehicleData({ images: updated })
  }

  const movePhoto = async (index, direction) => {
    const updated = [...photos]
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= updated.length) return
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setPhotos(updated)
    if (mainPhotoIndex === index) setMainPhotoIndex(newIndex)
    else if (mainPhotoIndex === newIndex) setMainPhotoIndex(index)
    await saveVehicleData({ images: updated })
  }

  const setMainPhoto = async (index) => {
    setMainPhotoIndex(index)
    toast.success('Image principale définie')
  }

  const addOption = async () => {
    if (!newOption.trim() || !selectedVehicule) return
    if (options.includes(newOption.trim())) {
      toast.error('Cette option existe déjà')
      return
    }
    const updated = [...options, newOption.trim()]
    setOptions(updated)
    setNewOption('')
    setShowSuggestions(false)
    await saveVehicleData({ options: updated })
  }

  const removeOption = async (index) => {
    const updated = options.filter((_, i) => i !== index)
    setOptions(updated)
    await saveVehicleData({ options: updated })
  }

  const addCouleur = async () => {
    if (!newCouleurHex || !selectedVehicule) return
    const updated = [...couleurs, { hex: newCouleurHex, nom: newCouleurNom }]
    setCouleurs(updated)
    setNewCouleurNom('')
    await saveVehicleData({ couleurs: updated })
  }

  const removeCouleur = async (index) => {
    const updated = couleurs.filter((_, i) => i !== index)
    setCouleurs(updated)
    await saveVehicleData({ couleurs: updated })
  }

  const saveVersion = async () => {
    if (!selectedVehicule) return
    await saveVehicleData({ version: version || null })
  }

  const saveDisponibilite = async (val) => {
    setDisponibilite(val)
    if (!selectedVehicule) return
    await saveVehicleData({ disponibilite: val })
  }

  const saveVehicleData = async (extraFields) => {
    if (!selectedVehicule) return
    setUpdating(true)
    try {
      await api.put(`/api/vehicules/${selectedVehicule.id}`, extraFields)
      const res = await api.get('/api/vehicules', { params: { limit: 200 } })
      setVehicules(res.data.data?.vehicules || [])
      const updated = res.data.data?.vehicules?.find(v => v.id === selectedVehicule.id)
      if (updated) setSelectedVehicule(updated)
      toast.success('Enregistré')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setUpdating(false)
    }
  }

  const filteredSuggestions = SUGGESTED_OPTIONS.filter(
    s => s.toLowerCase().includes(newOption.toLowerCase()) && !options.includes(s)
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-44" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="section-title">Médias & options</h1>

      {!selectedVehicule ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicules.length === 0 ? (
            <p className="text-gray-400 col-span-full">Aucun véhicule dans le catalogue.</p>
          ) : (
            vehicules.map(v => (
              <button key={v.id} onClick={() => selectVehicule(v)}
                className="vehicle-card text-left group">
                <div className="aspect-[16/10] bg-gray-100 flex items-center justify-center overflow-hidden">
                  {v.images && v.images.length > 0 ? (
                    <img src={v.images[0]} alt={`${v.marque} ${v.modele}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <span className="text-4xl font-black text-gray-200">{v.marque}</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900">{v.marque} {v.modele}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400">{v.annee}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400">{(v.images || []).length} photos</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400">{(v.options || []).length} options</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedVehicule(null)} className="btn-ghost mb-4 pl-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
            Retour à la liste
          </button>

          <div className="content-card p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900">{selectedVehicule.marque} {selectedVehicule.modele}</h2>
            <p className="text-sm text-gray-400 mt-1">{selectedVehicule.annee} · {Number(selectedVehicule.prix).toLocaleString('fr-FR')} MAD</p>
          </div>

          <div className="content-card p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Disponibilité</h3>
            <div className="flex flex-wrap gap-2">
              {['Disponible', 'En commande', 'Rupture de stock', 'Bientôt disponible'].map(d => (
                <button key={d} onClick={() => saveDisponibilite(d)} disabled={updating}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    disponibilite === d
                      ? 'bg-accent text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="content-card p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Version / Finition</h3>
            <div className="flex gap-3">
              <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="Ex: GTI, S-Line, Style..." className="form-input flex-1" />
              <button onClick={saveVersion} disabled={updating} className="btn-primary">Enregistrer</button>
            </div>
          </div>

          <div className="content-card p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Photos ({photos.length})</h3>
            <div className="flex gap-3 mb-6">
              <input type="url" value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} placeholder="URL de l'image (https://...)" className="form-input flex-1" />
              <button onClick={addPhoto} disabled={!newPhotoUrl.trim() || updating} className="btn-primary">+ Ajouter</button>
            </div>
            {photos.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">Aucune photo. Ajoutez une URL d'image ci-dessus.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, i) => (
                  <div key={i}
                    className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                      i === mainPhotoIndex ? 'border-accent' : 'border-gray-100'
                    }`}>
                    <div className="aspect-[4/3] bg-gray-100">
                      <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {i === mainPhotoIndex && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 bg-accent text-white text-[10px] font-bold rounded-md">PRINCIPALE</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 gap-2">
                      {i !== mainPhotoIndex && (
                        <button onClick={() => setMainPhoto(i)}
                          className="w-7 h-7 bg-white rounded-lg text-xs font-bold shadow hover:bg-gray-100 flex items-center justify-center"
                          title="Définir comme principale">★</button>
                      )}
                      {i > 0 && (
                        <button onClick={() => movePhoto(i, -1)}
                          className="w-7 h-7 bg-white rounded-lg text-xs shadow hover:bg-gray-100 flex items-center justify-center"
                          title="Déplacer à gauche">←</button>
                      )}
                      {i < photos.length - 1 && (
                        <button onClick={() => movePhoto(i, 1)}
                          className="w-7 h-7 bg-white rounded-lg text-xs shadow hover:bg-gray-100 flex items-center justify-center"
                          title="Déplacer à droite">→</button>
                      )}
                      <button onClick={() => removePhoto(i)}
                        className="w-7 h-7 bg-red-600 text-white rounded-lg text-xs shadow hover:bg-red-700 flex items-center justify-center"
                        title="Supprimer">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="content-card p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Couleurs disponibles</h3>
            <div className="flex gap-3 mb-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Couleur</label>
                <input type="color" value={newCouleurHex} onChange={(e) => setNewCouleurHex(e.target.value)}
                  className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
                <input type="text" value={newCouleurNom} onChange={(e) => setNewCouleurNom(e.target.value)}
                  placeholder="Ex: Noir Météorite, Blanc..." className="form-input" />
              </div>
              <button onClick={addCouleur} disabled={updating} className="btn-primary">+ Ajouter</button>
            </div>
            {couleurs.length === 0 ? (
              <p className="text-gray-400 text-sm py-2">Aucune couleur définie.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {couleurs.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                    <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} />
                    <span className="text-sm font-medium text-gray-700">{c.nom || c.hex}</span>
                    <button onClick={() => removeCouleur(i)} className="btn-ghost p-0.5 text-gray-400 hover:text-red-500">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="content-card p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Équipements ({options.length})</h3>
            <div className="relative mb-4">
              <div className="flex gap-3">
                <input type="text" value={newOption} onChange={(e) => { setNewOption(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)} placeholder="Ajouter un équipement..."
                  className="form-input flex-1"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption() } }} />
                <button onClick={addOption} disabled={!newOption.trim() || updating} className="btn-primary">+ Ajouter</button>
              </div>
              {showSuggestions && newOption && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-[90px] mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredSuggestions.slice(0, 10).map(s => (
                    <button key={s} onClick={() => { setNewOption(s); setShowSuggestions(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">{s}</button>
                  ))}
                </div>
              )}
            </div>
            {options.length === 0 ? (
              <p className="text-gray-400 text-sm py-2">Aucun équipement ajouté.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {options.map((opt, i) => (
                  <span key={i}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-full border border-gray-100">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {opt}
                    <button onClick={() => removeOption(i)} className="btn-ghost p-0.5 text-gray-400 hover:text-red-500">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaPage
