import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Logo from '../components/Logo'
import Pagination from '../components/Pagination'
import { SkeletonCard } from '../components/Skeleton'
import { useDebounce } from '../hooks/useDebounce'

const brandConfig = {
  volkswagen: { name: 'Volkswagen', apiMarque: 'VOLKSWAGEN', color: '#001E50', tagline: 'Das Auto.' },
  skoda: { name: 'Škoda', apiMarque: 'SKODA', color: '#4BA82E', tagline: 'Simply Clever' },
  audi: { name: 'Audi', apiMarque: 'AUDI', color: '#BB0A30', tagline: 'Vorsprung durch Technik' },
  porsche: { name: 'Porsche', apiMarque: 'PORSCHE', color: '#A30000', tagline: 'There is no substitute' },
}

const PAGE_SIZE = 9

function VehiclePlaceholder({ marque, className = '' }) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      <span className="text-5xl sm:text-6xl font-extrabold text-gray-200 select-none tracking-tighter">{marque}</span>
    </div>
  )
}

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

export default function BrandCataloguePage() {
  const { marque } = useParams()
  const [vehicules, setVehicules] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search)
  const isSearching = !!debouncedSearch.trim()

  const config = brandConfig[marque] || null
  const validMarque = config && config.apiMarque

  useEffect(() => {
    if (isSearching) return
    const fetchVehicules = async () => {
      if (!validMarque) {
        setVehicules([])
        setPagination({ page: 1, totalPages: 1, total: 0 })
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const res = await api.get('/api/vehicules', {
          params: { marque: config.apiMarque, statut: 'DISPONIBLE', page, limit: PAGE_SIZE },
        })
        setVehicules(res.data.data?.vehicules || [])
        setPagination(res.data.data?.pagination || { page: 1, totalPages: 1, total: 0 })
      } catch (err) {
        console.error(err)
        setVehicules([])
      } finally {
        setLoading(false)
      }
    }
    fetchVehicules()
  }, [marque, validMarque, config, page, isSearching])

  useEffect(() => {
    if (!isSearching) return
    const fetchAll = async () => {
      if (!validMarque) {
        setVehicules([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const res = await api.get('/api/vehicules', {
          params: { marque: config.apiMarque, statut: 'DISPONIBLE' },
        })
        setVehicules(res.data.data?.vehicules || [])
      } catch (err) {
        console.error(err)
        setVehicules([])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [marque, validMarque, config, isSearching])

  useEffect(() => { setPage(1) }, [debouncedSearch])

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

  if (!config) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Marque inconnue</h1>
          <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 lg:pt-24 overflow-hidden" style={{ backgroundColor: config.color }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/" className="text-white/50 hover:text-white text-sm transition-colors duration-200">
              Accueil
            </Link>
            <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white text-sm font-medium">{config.name}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none">
            Catalogue
          </h1>
          <p className="mt-2 text-2xl sm:text-3xl font-light text-white/60 tracking-tight flex items-center gap-3">
            <Logo type={marque} className="h-10 w-10" />
            {config.name}
          </p>
          <p className="mt-4 text-white/40 text-base font-medium tracking-wide uppercase">
            {config.tagline}
          </p>
        </div>
      </section>

      {/* Brand Nav */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-4 overflow-x-auto">
            {Object.entries(brandConfig).filter(([k]) => k !== marque).map(([slug, b]) => (
              <Link
                key={slug}
                to={`/catalogue/${slug}`}
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 whitespace-nowrap"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-8 max-w-md">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par marque, modèle, version..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                aria-label="Rechercher un véhicule"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="vehicle-card">
                  <SkeletonCard className="aspect-[16/10]" />
                  <div className="p-6 space-y-3">
                    <div className="skeleton h-4 w-1/3" />
                    <div className="skeleton h-6 w-2/3" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-6 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayData.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun véhicule trouvé</h3>
              <p className="text-gray-400 text-sm mb-8">
                {debouncedSearch ? 'Aucun résultat pour votre recherche.' : `Aucun véhicule ${config.name} n'est actuellement disponible.`}
              </p>
              {debouncedSearch ? (
                <button onClick={() => setSearch('')} className="btn-outline">
                  Réinitialiser la recherche
                </button>
              ) : (
                <Link to="/" className="btn-outline">
                  Retour à l'accueil
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-10">
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  {displayTotal} résultat{displayTotal > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {displayData.map((v, index) => {
                  const vehicleOptions = Array.isArray(v.options) ? v.options : []
                  const displayOptions = vehicleOptions.slice(0, 4).map(o => typeof o === 'string' ? o : o.nom || o.name || o.label || '').filter(Boolean)

                  return (
                    <Link
                      key={v.id}
                      to={`/vehicule/${v.id}`}
                      className="vehicle-card group block"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="aspect-[16/10] bg-gray-50 relative overflow-hidden">
                        {v.images && v.images.length > 0 ? (
                          <img
                            src={v.images[0]}
                            alt={`${v.marque} ${v.modele}`}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <VehiclePlaceholder marque={v.marque} className="w-full h-full" />
                        )}
                        <div className="absolute top-4 left-4">
                          <StatusBadge disponibilite={v.disponibilite} />
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Logo type={marque} className="h-5 w-5" />
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{v.marque}</p>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{v.modele}</h3>
                            {v.version && (
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{v.version}</p>
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded flex-shrink-0">{v.annee}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                          <span>{v.carburant}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          <span>{v.transmission}</span>
                        </div>

                        {displayOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {displayOptions.map((opt) => (
                              <span key={opt} className="px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100">
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-4 border-t border-gray-100">
                          <span className="price-tag text-lg">
                            <span className="text-sm font-normal text-gray-500">À partir de </span>{Number(v.prix).toLocaleString('fr-FR')} <span className="text-sm font-semibold text-gray-400">MAD</span>
                          </span>
                        </div>
                      </div>
                    </Link>
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
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <span className="text-2xl font-black text-white tracking-tighter">Bouderka</span>
            <p className="mt-2 text-sm text-gray-600">&copy; {new Date().getFullYear()} Bouderka SARL. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
