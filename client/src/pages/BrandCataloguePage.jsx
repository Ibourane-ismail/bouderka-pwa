import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'

const brandConfig = {
  volkswagen: { name: 'Volkswagen', apiMarque: 'VOLKSWAGEN', color: '#001E50', tagline: 'Das Auto.' },
  skoda: { name: 'Škoda', apiMarque: 'SKODA', color: '#4BA82E', tagline: 'Simply Clever' },
  audi: { name: 'Audi', apiMarque: 'AUDI', color: '#BB0A30', tagline: 'Vorsprung durch Technik' },
  porsche: { name: 'Porsche', apiMarque: null, color: '#A30000', tagline: 'There is no substitute' },
}

const EQUIPMENT_ICONS = {
  GPS: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  'Apple CarPlay': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  'Android Auto': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  Bluetooth: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  'Caméra de recul': 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  'Jantes alliage': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'Climatisation automatique': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  'Toit panoramique': 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'Radar avant': 'M13 10V3L4 14h7v7l9-11h-7z',
  'Radar arrière': 'M13 10V3L4 14h7v7l9-11h-7z',
}

function EquipmentBadge({ name }) {
  const iconPath = EQUIPMENT_ICONS[name]
  return (
    <span className="equipment-badge">
      {iconPath ? (
        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {name}
    </span>
  )
}

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
  const [loading, setLoading] = useState(true)

  const config = brandConfig[marque] || null
  const validMarque = config && config.apiMarque

  useEffect(() => {
    const fetchVehicules = async () => {
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
    fetchVehicules()
  }, [marque, validMarque, config])

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
          <p className="mt-2 text-2xl sm:text-3xl font-light text-white/60 tracking-tight">
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
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : vehicules.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun véhicule disponible</h3>
              <p className="text-gray-400 text-sm mb-8">
                Aucun véhicule {config.name} n'est actuellement disponible.
              </p>
              <Link
                to="/"
                className="btn-outline"
              >
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-10">
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  {vehicules.length} résultat{vehicules.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {vehicules.map((v, index) => {
                  const vehicleOptions = Array.isArray(v.options) ? v.options : []
                  const displayOptions = vehicleOptions.slice(0, 4).map(o => typeof o === 'string' ? o : o.nom || o.name || o.label || '').filter(Boolean)

                  return (
                    <Link
                      key={v.id}
                      to={`/vehicule/${v.id}`}
                      className="vehicle-card group block"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      {/* Image */}
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

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{v.marque}</p>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{v.modele}</h3>
                            {v.version && (
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{v.version}</p>
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded flex-shrink-0">{v.annee}</span>
                        </div>

                        {/* Specs */}
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                          <span>{v.carburant}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          <span>{v.transmission}</span>
                        </div>

                        {/* Equipment badges */}
                        {displayOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {displayOptions.map((opt) => (
                              <span key={opt} className="px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100">
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Price */}
                        <div className="pt-4 border-t border-gray-100">
                          <span className="price-tag text-lg">
                            {Number(v.prix).toLocaleString('fr-FR')} <span className="text-sm font-semibold text-gray-400">MAD</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
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
