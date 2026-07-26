import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Logo from '../../components/Logo'
import Pagination from '../../components/Pagination'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'

const MARQUES = ['', 'VOLKSWAGEN', 'AUDI', 'SKODA', 'PORSCHE']
const PAGE_SIZE = 9

function StatusBadge({ disponibilite }) {
  const config = {
    'Disponible': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    'En commande': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    'Rupture de stock': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    'Bientôt disponible': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  }
  const c = config[disponibilite] || config['Disponible']
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {disponibilite || 'Disponible'}
    </span>
  )
}

function VehiclePlaceholder({ marque, className = '' }) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      <span className="text-5xl font-black text-gray-200 select-none tracking-tighter">{marque}</span>
    </div>
  )
}

const CataloguePage = () => {
  const [vehicules, setVehicules] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [marque, setMarque] = useState('')
  const [prixMax, setPrixMax] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search)
  const isSearching = !!debouncedSearch.trim()
  const [testDriveId, setTestDriveId] = useState(null)
  const [testDriveDate, setTestDriveDate] = useState('')

  const fetchVehiculesPage = useCallback(async (pageNum) => {
    setLoading(true)
    try {
      const params = { statut: 'DISPONIBLE', page: pageNum, limit: PAGE_SIZE }
      if (marque) params.marque = marque
      if (prixMax) params.prixMax = prixMax
      const res = await api.get('/api/vehicules', { params })
      setVehicules(res.data.data.vehicules || [])
      setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [marque, prixMax])

  const fetchAllVehicules = useCallback(async () => {
    setLoading(true)
    try {
      const params = { statut: 'DISPONIBLE' }
      if (marque) params.marque = marque
      if (prixMax) params.prixMax = prixMax
      const res = await api.get('/api/vehicules', { params })
      setVehicules(res.data.data.vehicules || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [marque, prixMax])

  useEffect(() => {
    if (isSearching) {
      fetchAllVehicules()
    } else {
      fetchVehiculesPage(page)
    }
  }, [marque, prixMax, page, isSearching, fetchVehiculesPage, fetchAllVehicules])

  useEffect(() => { setPage(1) }, [marque, prixMax, debouncedSearch])

  const filtered = useMemo(() => {
    if (!isSearching) return vehicules
    const q = debouncedSearch.toLowerCase()
    return vehicules.filter(v =>
      (v.marque || '').toLowerCase().includes(q) ||
      (v.modele || '').toLowerCase().includes(q) ||
      (v.version || '').toLowerCase().includes(q)
    )
  }, [vehicules, debouncedSearch, isSearching])

  const displayData = isSearching
    ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : vehicules

  const displayTotalPages = isSearching
    ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    : pagination.totalPages

  const displayTotal = isSearching ? filtered.length : pagination.total

  const handleTestDrive = async (vehiculeId) => {
    if (!testDriveDate) { toast.error('Sélectionnez une date'); return }
    try {
      await api.post('/api/testdrive', { vehiculeId, dateHeure: new Date(testDriveDate).toISOString() })
      toast.success('Demande de test drive envoyée')
      setTestDriveId(null)
      setTestDriveDate('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="section-title">Catalogue</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par marque, modèle, version..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
            aria-label="Rechercher un véhicule"
          />
        </div>
        <select
          value={marque}
          onChange={(e) => setMarque(e.target.value)}
          className="form-select w-auto min-w-[180px]"
          aria-label="Filtrer par marque"
        >
          <option value="">Toutes les marques</option>
          {MARQUES.filter(Boolean).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          type="number"
          placeholder="Prix max (MAD)"
          value={prixMax}
          onChange={(e) => setPrixMax(e.target.value)}
          className="form-input w-48"
          aria-label="Prix maximum"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="vehicle-card">
              <div className="skeleton aspect-[16/10]" />
              <div className="p-6 space-y-3">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-6 w-2/3" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-6 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="empty-state-title">Aucun véhicule disponible</h3>
          <p className="empty-state-text">Modifiez vos filtres ou votre recherche pour voir plus de résultats.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {displayData.map(v => {
              const vehicleOptions = Array.isArray(v.options) ? v.options : []
              const displayOptions = vehicleOptions.slice(0, 4).map(o => typeof o === 'string' ? o : o.nom || o.name || o.label || '').filter(Boolean)

              return (
                <div key={v.id} className="vehicle-card group">
                  <Link to={`/vehicule/${v.id}`} className="block">
                    <div className="aspect-[16/10] bg-gray-50 relative overflow-hidden">
                      {v.images && v.images.length > 0 ? (
                        <img src={v.images[0]} alt={`${v.marque} ${v.modele}`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
                      ) : (
                        <VehiclePlaceholder marque={v.marque} className="w-full h-full" />
                      )}
                      <div className="absolute top-4 left-4">
                        <StatusBadge disponibilite={v.disponibilite} />
                      </div>
                    </div>
                  </Link>

                  <div className="p-6">
                    <Link to={`/vehicule/${v.id}`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <Logo type={v.marque?.toLowerCase()} className="h-5 w-5" />
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{v.marque}</p>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 leading-tight">{v.modele}</h3>
                          {v.version && <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{v.version}</p>}
                        </div>
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded flex-shrink-0">{v.annee}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        <span>{v.carburant}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                        <span>{v.transmission}</span>
                      </div>

                      {displayOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {displayOptions.map((opt) => (
                            <span key={opt} className="px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100">{opt}</span>
                          ))}
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-100">
                        <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                          <span className="text-sm font-normal text-gray-500">À partir de </span>{Number(v.prix).toLocaleString('fr-FR')} <span className="text-sm font-semibold text-gray-400">MAD</span>
                        </span>
                      </div>
                    </Link>

                    {testDriveId === v.id ? (
                      <div className="mt-4 flex gap-2">
                        <input
                          type="datetime-local"
                          value={testDriveDate}
                          onChange={(e) => setTestDriveDate(e.target.value)}
                          className="form-input flex-1"
                          aria-label="Date et heure du test drive"
                        />
                        <button onClick={() => handleTestDrive(v.id)} className="btn-primary px-4 text-xs" aria-label="Confirmer le test drive">OK</button>
                        <button onClick={() => setTestDriveId(null)} className="btn-outline px-3 text-xs" aria-label="Annuler">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setTestDriveId(v.id)} className="mt-4 w-full btn-primary text-sm" aria-label={`Demander un essai pour ${v.marque} ${v.modele}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Demander un essai
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={displayTotalPages}
            totalItems={displayTotal}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}

export default CataloguePage
