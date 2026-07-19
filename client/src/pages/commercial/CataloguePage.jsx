import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Logo from '../../components/Logo'
import toast from 'react-hot-toast'
import StatutBadge from '../../components/StatutBadge'
import DataTable from '../../components/DataTable'

const MARQUES = ['VOLKSWAGEN', 'AUDI', 'SKODA']
const CARBURANTS = ['Essence', 'Diesel', 'Hybride', 'Électrique']
const TRANSMISSIONS = ['Manuelle', 'Automatique']

const emptyForm = {
  marque: 'VOLKSWAGEN',
  modele: '',
  version: '',
  finition: '',
  annee: '',
  prix: '',
  prixPromo: '',
  kilometrage: '',
  carburant: 'Essence',
  transmission: 'Manuelle',
  description: '',
}

const CataloguePage = () => {
  const navigate = useNavigate()
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchVehicules = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/vehicules', { params: { limit: 500 } })
      setVehicules(res.data.data.vehicules || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVehicules() }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
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
      kilometrage: v.kilometrage,
      carburant: v.carburant,
      transmission: v.transmission,
      description: v.description || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
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
        kilometrage: Number(form.kilometrage),
        carburant: form.carburant,
        transmission: form.transmission,
        description: form.description,
      }

      if (editingId) {
        await api.put(`/api/vehicules/${editingId}`, payload)
        toast.success('Véhicule modifié')
      } else {
        await api.post('/api/vehicules', payload)
        toast.success('Véhicule ajouté')
      }
      setShowModal(false)
      fetchVehicules()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/vehicules/${id}`)
      toast.success('Véhicule supprimé')
      setDeleteConfirm(null)
      fetchVehicules()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="skeleton h-12 w-44" />
        <div className="skeleton h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Catalogue</h1>
        <button onClick={openAdd} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un véhicule
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'marque', label: 'Marque', render: (v) => <div className="flex items-center gap-2"><Logo type={v.marque?.toLowerCase()} className="h-5 w-5" /><span className="font-semibold">{v.marque}</span></div> },
          { key: 'modele', label: 'Modèle' },
          { key: 'version', label: 'Version', render: (v) => v.version || '—' },
          { key: 'annee', label: 'Année' },
          {
            key: 'prix', label: 'Prix',
            render: (v) => v.prixPromo ? (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 line-through text-xs">{Number(v.prix).toLocaleString('fr-FR')} MAD</span>
                <span className="font-bold text-accent">{Number(v.prixPromo).toLocaleString('fr-FR')} MAD</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-accent text-white font-bold">PROMO</span>
              </div>
            ) : (
              <span>{Number(v.prix).toLocaleString('fr-FR')} MAD</span>
            ),
          },
          { key: 'statut', label: 'Statut', render: (v) => <StatutBadge statut={v.statut} /> },
          {
            key: 'actions', label: 'Actions',
            className: 'text-right',
            render: (v) => (
              <div className="flex justify-end gap-2">
                <button onClick={(e) => { e.stopPropagation(); openEdit(v) }} className="btn-outline px-3 py-1.5 text-xs">Modifier</button>
                <button onClick={(e) => { e.stopPropagation(); navigate('/commercial/media') }} className="btn-outline px-3 py-1.5 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Médias
                </button>
                {deleteConfirm === v.id ? (
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(v.id) }} className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">Confirmer</button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null) }} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">Annuler</button>
                  </div>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(v.id) }} className="px-3 py-1.5 bg-transparent text-red-500 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors">Supprimer</button>
                )}
              </div>
            ),
          },
        ]}
        data={vehicules}
        renderMobileCard={(v) => (
          <div key={v.id} className="content-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 flex items-center gap-2"><Logo type={v.marque?.toLowerCase()} className="h-5 w-5" />{v.marque} {v.modele}</span>
              <StatutBadge statut={v.statut} />
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{v.annee}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{v.kilometrage?.toLocaleString('fr-FR')} km</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{v.carburant}</span>
            </div>
            <div className="text-sm font-bold text-gray-900">
              {v.prixPromo ? (
                <div className="flex items-center gap-2">
                  <span className="text-accent">{Number(v.prixPromo).toLocaleString('fr-FR')} MAD</span>
                  <span className="text-gray-400 line-through text-xs">{Number(v.prix).toLocaleString('fr-FR')} MAD</span>
                </div>
              ) : (
                <span>{Number(v.prix).toLocaleString('fr-FR')} MAD</span>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={(e) => { e.stopPropagation(); openEdit(v) }} className="btn-outline flex-1 py-1.5 text-xs">Modifier</button>
              <button onClick={(e) => { e.stopPropagation(); navigate('/commercial/media') }} className="btn-outline py-1.5 text-xs">Médias</button>
              {deleteConfirm === v.id ? (
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(v.id) }} className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg">Confirmer</button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null) }} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">Annuler</button>
                </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(v.id) }} className="px-3 py-1.5 text-red-500 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors">Supprimer</button>
              )}
            </div>
          </div>
        )}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="content-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h2>
                <button onClick={() => setShowModal(false)} className="btn-ghost p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="form-label">Marque</label>
                  <select name="marque" value={form.marque} onChange={handleChange} required className="form-select">
                    {MARQUES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-label">Modèle</label>
                  <input type="text" name="modele" value={form.modele} onChange={handleChange} required className="form-input" />
                </div>

                <div>
                  <label className="form-label">Version</label>
                  <input type="text" name="version" value={form.version} onChange={handleChange} placeholder="Ex: GTI, S-Line, Style..." className="form-input" />
                </div>

                <div>
                  <label className="form-label">Finition</label>
                  <input type="text" name="finition" value={form.finition} onChange={handleChange} placeholder="Ex: Pack, Luxe, Sport..." className="form-input" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Année</label>
                    <input type="number" name="annee" value={form.annee} onChange={handleChange} required min="1900" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Kilométrage</label>
                    <input type="number" name="kilometrage" value={form.kilometrage} onChange={handleChange} required min="0" className="form-input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Prix (MAD)</label>
                    <input type="number" name="prix" value={form.prix} onChange={handleChange} required min="0" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Prix promo (MAD)</label>
                    <input type="number" name="prixPromo" value={form.prixPromo} onChange={handleChange} min="0" className="form-input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Carburant</label>
                    <select name="carburant" value={form.carburant} onChange={handleChange} required className="form-select">
                      {CARBURANTS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Transmission</label>
                    <select name="transmission" value={form.transmission} onChange={handleChange} required className="form-select">
                      {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="form-input" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Enregistrement...' : editingId ? 'Modifier' : 'Ajouter'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Annuler</button>
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
