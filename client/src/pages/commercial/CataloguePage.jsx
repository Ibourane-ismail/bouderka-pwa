import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Logo from '../../components/Logo'
import toast from 'react-hot-toast'
import StatutBadge from '../../components/StatutBadge'
import DataTable from '../../components/DataTable'
import Pagination from '../../components/Pagination'
import PremiumSelect from '../../components/PremiumSelect'

const MARQUES = ['VOLKSWAGEN', 'AUDI', 'SKODA', 'PORSCHE']
const MARQUE_OPTIONS = MARQUES.map(m => ({
  value: m,
  label: m.charAt(0) + m.slice(1).toLowerCase(),
  icon: <Logo type={m.toLowerCase()} className="h-4 w-4" />,
}))
const MARQUE_FILTER_OPTIONS = [
  { value: '', label: 'Toutes', icon: null },
  ...MARQUE_OPTIONS,
]
const CARBURANTS = ['Essence', 'Diesel', 'Hybride', 'Électrique']
const CARBURANT_OPTIONS = CARBURANTS.map(c => ({ value: c, label: c }))
const TRANSMISSIONS = ['Manuelle', 'Automatique']
const TRANSMISSION_OPTIONS = TRANSMISSIONS.map(t => ({ value: t, label: t }))
const PAGE_SIZE = 10

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

const CataloguePage = () => {
  const navigate = useNavigate()
  const [vehicules, setVehicules] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [page, setPage] = useState(1)
  const [filterMarque, setFilterMarque] = useState('')

  const fetchVehicules = useCallback(async (pageNum = page) => {
    setLoading(true)
    try {
      const params = { page: pageNum, limit: PAGE_SIZE }
      if (filterMarque) params.marque = filterMarque
      const res = await api.get('/api/vehicules', { params })
      setVehicules(res.data.data.vehicules || [])
      setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, filterMarque])

  useEffect(() => { fetchVehicules(page) }, [fetchVehicules, page])

  useEffect(() => { setPage(1) }, [filterMarque])

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

  const handleFormChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
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

      <div>
        <PremiumSelect
          value={filterMarque}
          onChange={setFilterMarque}
          options={MARQUE_FILTER_OPTIONS}
          placeholder="Filtrer par marque"
        />
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
                <span className="font-bold text-accent">À partir de {Number(v.prixPromo).toLocaleString('fr-FR')} MAD</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-accent text-white font-bold">PROMO</span>
              </div>
            ) : (
              <span><span className="text-gray-400 font-normal">À partir de </span>{Number(v.prix).toLocaleString('fr-FR')} MAD</span>
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
              <span>{v.carburant}</span>
            </div>
            <div className="text-sm font-bold text-gray-900">
              {v.prixPromo ? (
                <div className="flex items-center gap-2">
                  <span className="text-accent">À partir de {Number(v.prixPromo).toLocaleString('fr-FR')} MAD</span>
                  <span className="text-gray-400 line-through text-xs">{Number(v.prix).toLocaleString('fr-FR')} MAD</span>
                </div>
              ) : (
                <span><span className="font-normal text-gray-400">À partir de </span>{Number(v.prix).toLocaleString('fr-FR')} MAD</span>
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
                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(v.id) }} className="px-3 py-1.5 bg-red-500 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors">Supprimer</button>
              )}
            </div>
          </div>
        )}
      />

      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        onPageChange={setPage}
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
                <PremiumSelect
                  label="Marque"
                  value={form.marque}
                  onChange={(v) => handleFormChange('marque', v)}
                  options={MARQUE_OPTIONS}
                  required
                />

                <div>
                  <label className="form-label">Modèle</label>
                  <input type="text" name="modele" value={form.modele} onChange={(e) => handleFormChange('modele', e.target.value)} required className="form-input" />
                </div>

                <div>
                  <label className="form-label">Version</label>
                  <input type="text" name="version" value={form.version} onChange={(e) => handleFormChange('version', e.target.value)} placeholder="Ex: GTI, S-Line, Style..." className="form-input" />
                </div>

                <div>
                  <label className="form-label">Finition</label>
                  <input type="text" name="finition" value={form.finition} onChange={(e) => handleFormChange('finition', e.target.value)} placeholder="Ex: Pack, Luxe, Sport..." className="form-input" />
                </div>

                <div>
                  <label className="form-label">Année</label>
                  <input type="number" name="annee" value={form.annee} onChange={(e) => handleFormChange('annee', e.target.value)} required min="1900" className="form-input" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Prix (MAD)</label>
                    <input type="number" name="prix" value={form.prix} onChange={(e) => handleFormChange('prix', e.target.value)} required min="0" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Prix promo (MAD)</label>
                    <input type="number" name="prixPromo" value={form.prixPromo} onChange={(e) => handleFormChange('prixPromo', e.target.value)} min="0" className="form-input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <PremiumSelect
                    label="Carburant"
                    value={form.carburant}
                    onChange={(v) => handleFormChange('carburant', v)}
                    options={CARBURANT_OPTIONS}
                    required
                  />
                  <PremiumSelect
                    label="Transmission"
                    value={form.transmission}
                    onChange={(v) => handleFormChange('transmission', v)}
                    options={TRANSMISSION_OPTIONS}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea name="description" value={form.description} onChange={(e) => handleFormChange('description', e.target.value)} rows={3} className="form-input" />
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
