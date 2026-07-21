import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Logo from '../components/Logo'
import Skeleton from '../components/Skeleton'
import toast from 'react-hot-toast'

const brandConfig = {
  VOLKSWAGEN: { name: 'Volkswagen', slug: 'volkswagen', color: '#001E50' },
  AUDI: { name: 'Audi', slug: 'audi', color: '#BB0A30' },
  SKODA: { name: 'Škoda', slug: 'skoda', color: '#4BA82E' },
}

const EQUIPMENT_ICONS = {
  GPS: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  'Apple CarPlay': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  'Android Auto': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  Bluetooth: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  'Caméra de recul': 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  'Caméra 360°': 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  'Jantes alliage': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'Climatisation automatique': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  'Toit panoramique': 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'Radar avant': 'M13 10V3L4 14h7v7l9-11h-7z',
  'Radar arrière': 'M13 10V3L4 14h7v7l9-11h-7z',
  'Sièges chauffants': 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
  'Volant chauffant': 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
  'Régulateur de vitesse': 'M13 10V3L4 14h7v7l9-11h-7z',
  'Sellerie cuir': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  'Aide au stationnement': 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
}

const statusConfig = {
  DISPONIBLE: { text: 'Disponible', bg: 'bg-emerald-50', textClass: 'text-emerald-700', dot: 'bg-emerald-500' },
  EN_COMMANDE: { text: 'En commande', bg: 'bg-blue-50', textClass: 'text-blue-700', dot: 'bg-blue-500' },
  RUPTURE: { text: 'Rupture de stock', bg: 'bg-red-50', textClass: 'text-red-700', dot: 'bg-red-500' },
  BIENTOT: { text: 'Bientôt disponible', bg: 'bg-amber-50', textClass: 'text-amber-700', dot: 'bg-amber-500' },
}

function VehiclePlaceholder({ marque, className = '' }) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      <span className="text-6xl sm:text-8xl font-black text-gray-200 select-none tracking-tighter">{marque}</span>
    </div>
  )
}

export default function VehicleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [vehicule, setVehicule] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [activeImage, setActiveImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [essaiOpen, setEssaiOpen] = useState(false)
  const [essaiDate, setEssaiDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const fetchVehicule = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/api/vehicules/${id}`)
      const v = res.data.data?.vehicule
      if (!v) { setError('Véhicule non trouvé'); return }
      setVehicule(v)
      setActiveImage(0)
      setSelectedColor(null)

      try {
        const simRes = await api.get('/api/vehicules', {
          params: { marque: v.marque, statut: 'DISPONIBLE', limit: 10 },
        })
        const all = simRes.data.data?.vehicules || []
        setSimilar(all.filter((s) => s.id !== v.id).slice(0, 3))
      } catch { setSimilar([]) }
    } catch { setError('Véhicule non trouvé') }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => {
    fetchVehicule()
    window.scrollTo(0, 0)
  }, [fetchVehicule])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false)
        setEssaiOpen(false)
      }
      if (lightboxOpen) {
        if (e.key === 'ArrowLeft') navigateImage(-1)
        if (e.key === 'ArrowRight') navigateImage(1)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, activeImage])

  const navigateImage = (dir) => {
    const images = vehicule?.images || []
    if (images.length <= 1) return
    setActiveImage((prev) => (prev + dir + images.length) % images.length)
  }

  const handleEssai = async () => {
    if (!essaiDate) { toast.error('Sélectionnez une date et heure'); return }
    setSubmitting(true)
    try {
      await api.post('/api/testdrive', {
        vehiculeId: vehicule.id,
        dateHeure: new Date(essaiDate).toISOString(),
      })
      toast.success("Votre demande d'essai a été envoyée")
      setEssaiOpen(false)
      setEssaiDate('')
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi")
    } finally { setSubmitting(false) }
  }

  const handleRdvClick = () => {
    if (user) navigate('/client/rdv')
    else navigate('/login', { state: { from: { pathname: `/vehicule/${id}` } } })
  }

  const handleEssaiClick = () => {
    if (!user) { navigate('/login', { state: { from: { pathname: `/vehicule/${id}` } } }); return }
    setEssaiOpen(true)
  }

  const images = vehicule?.images || []
  const hasImages = images.length > 0
  const brand = brandConfig[vehicule?.marque] || null
  const status = statusConfig[vehicule?.statut] || statusConfig.DISPONIBLE

  const couleurs = vehicule?.couleurs || []
  const hasCouleurs = Array.isArray(couleurs) && couleurs.length > 0

  const options = vehicule?.options || []
  const hasOptions = Array.isArray(options) && options.length > 0

  const displayImages = selectedColor && vehicule?.imagesCouleurs?.[selectedColor]
    ? [vehicule.imagesCouleurs[selectedColor], ...images.filter((_, i) => i > 0)]
    : images

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              <div className="lg:col-span-3 space-y-4">
                <Skeleton className="aspect-[16/10] rounded-2xl" />
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="w-20 h-16 rounded-lg" />)}
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-6 w-24 rounded" />
                <Skeleton className="h-10 w-3/4 rounded-lg" />
                <Skeleton className="h-5 w-1/2 rounded" />
                <Skeleton className="h-10 w-1/3 rounded-lg" />
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !vehicule) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Véhicule introuvable</h2>
            <p className="text-gray-400 mb-8">Ce véhicule n'existe pas ou a été supprimé.</p>
            <Link to="/catalogue/volkswagen" className="btn-primary">Retour au catalogue</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-16 lg:pt-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-400 hover:text-gray-900 transition-colors">Accueil</Link>
            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link to={brand ? `/catalogue/${brand.slug}` : '/catalogue/volkswagen'} className="text-gray-400 hover:text-gray-900 transition-colors">
              {brand?.name || vehicule.marque}
            </Link>
            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{vehicule.marque} {vehicule.modele}</span>
          </nav>
        </div>
      </div>

      {/* Gallery + Info */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">

            {/* Gallery */}
            <div className="lg:col-span-3">
              {/* Main Image */}
              <div
                className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-[16/10] cursor-zoom-in group"
                onClick={() => setLightboxOpen(true)}
              >
                {hasImages ? (
                  <img
                    src={displayImages[activeImage] || images[activeImage]}
                    alt={`${vehicule.marque} ${vehicule.modele}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                ) : (
                  <VehiclePlaceholder marque={vehicule.marque} className="w-full h-full" />
                )}

                {/* Status badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.textClass} backdrop-blur-sm`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.text}
                  </span>
                </div>

                {/* Image counter */}
                {hasImages && displayImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                    {activeImage + 1} / {displayImages.length}
                  </div>
                )}

                {/* Nav arrows */}
                {hasImages && displayImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigateImage(-1) }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-lg"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigateImage(1) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-lg"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {hasImages && displayImages.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {displayImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`gallery-thumb flex-shrink-0 w-20 h-16 sm:w-24 sm:h-[72px] ${i === activeImage ? 'active' : ''}`}
                    >
                      <img src={img} alt={`${vehicule.marque} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-28">
                {/* Brand tag */}
                {brand && (
                  <span className="inline-flex items-center px-3 py-1 rounded text-xs font-bold text-white mb-4 uppercase tracking-wider" style={{ backgroundColor: brand.color }}>
                    {brand.name}
                  </span>
                )}

                {/* Title */}
                {brand && (
                  <div className="flex items-center gap-3 mb-2">
                    <Logo type={brand.slug} className="h-12 w-12" />
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-tight text-gray-900">
                      {vehicule.marque} {vehicule.modele}
                    </h1>
                  </div>
                )}
                {!brand && (
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-tight text-gray-900">
                    {vehicule.marque} {vehicule.modele}
                  </h1>
                )}

                {/* Version */}
                {(vehicule.version || vehicule.finition) && (
                  <p className="mt-1.5 text-sm font-semibold text-gray-400 uppercase tracking-widest">
                    {vehicule.version || vehicule.finition}
                  </p>
                )}

                {/* Price */}
                <div className="mt-5">
                  <span className="price-tag text-3xl sm:text-4xl">
                    <span className="text-base font-normal text-gray-500">À partir de </span>{Number(vehicule.prix).toLocaleString('fr-FR')} <span className="text-base font-semibold text-gray-400">MAD</span>
                  </span>
                </div>

                {/* Key Info */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Marque</div>
                    <div className="text-sm font-bold text-gray-900">{brand?.name || vehicule.marque}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Modèle</div>
                    <div className="text-sm font-bold text-gray-900">{vehicule.modele}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Année</div>
                    <div className="text-sm font-bold text-gray-900">{vehicule.annee}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Carburant</div>
                    <div className="text-sm font-bold text-gray-900">{vehicule.carburant}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Transmission</div>
                    <div className="text-sm font-bold text-gray-900">{vehicule.transmission}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Disponibilité</div>
                    <div className="text-sm font-bold text-gray-900">{vehicule.disponibilite || 'Disponible'}</div>
                  </div>
                </div>

                {/* Colors */}
                {hasCouleurs && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Couleurs disponibles</p>
                    <div className="flex flex-wrap gap-2">
                      {couleurs.map((c) => {
                        const hex = typeof c === 'string' ? c : c.hex || c.couleur
                        const nom = typeof c === 'object' ? (c.nom || c.name || '') : ''
                        if (!hex) return null
                        return (
                          <button
                            key={hex}
                            onClick={() => setSelectedColor(selectedColor === hex ? null : hex)}
                            title={nom || hex}
                            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 flex-shrink-0 ${
                              selectedColor === hex
                                ? 'border-gray-900 ring-2 ring-gray-900/20 scale-110'
                                : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        )
                      })}
                    </div>
                    {selectedColor && (
                      <p className="mt-2 text-xs text-gray-400">
                        {couleurs.find((c) => {
                          const hex = typeof c === 'string' ? c : c.hex || c.couleur
                          return hex === selectedColor
                        })?.nom || ''}
                      </p>
                    )}
                  </div>
                )}

                {/* CTAs */}
                <div className="mt-8 space-y-3">
                  <button onClick={handleRdvClick} className="btn-primary w-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Prendre un rendez-vous
                  </button>

                  {vehicule.statut === 'DISPONIBLE' && (
                    <button onClick={handleEssaiClick} className="btn-outline w-full">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Réserver un essai
                    </button>
                  )}
                </div>

                {/* Phone */}
                <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Besoin d'aide ?</div>
                    <div className="text-sm font-bold text-gray-900">Contactez-nous directement</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {vehicule.description && (
        <section className="py-12 lg:py-16 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title mb-6">Description</h2>
            <div className="max-w-3xl">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px]">
                {vehicule.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Équipements */}
      {hasOptions && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title mb-8">Équipements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {options.map((opt) => {
                const label = typeof opt === 'string' ? opt : opt.nom || opt.name || opt.label
                if (!label) return null
                const iconPath = EQUIPMENT_ICONS[label]
                return (
                  <div key={label} className="equipment-badge justify-start">
                    {iconPath ? (
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Véhicules similaires */}
      {similar.length > 0 && (
        <section className="py-12 lg:py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title">Véhicules similaires</h2>
              <Link to={brand ? `/catalogue/${brand.slug}` : '#'} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                Voir tout →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {similar.map((v) => (
                <Link
                  key={v.id}
                  to={`/vehicule/${v.id}`}
                  className="vehicle-card group block"
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
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{v.marque}</p>
                    <h3 className="font-bold text-gray-900">{v.modele}</h3>
                    <p className="text-xs text-gray-400 mt-1">{v.annee} · {v.carburant} · {v.transmission}</p>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="font-bold text-gray-900"><span className="font-normal text-gray-400 text-xs">À partir de </span>{Number(v.prix).toLocaleString('fr-FR')} <span className="text-xs font-semibold text-gray-400">MAD</span></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-2xl font-black text-white tracking-tighter">Bouderka</span>
          <p className="mt-2 text-sm text-gray-600">&copy; {new Date().getFullYear()} Bouderka SARL. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage(-1) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage(1) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <img
            src={displayImages[activeImage] || images[activeImage]}
            alt={`${vehicule.marque} ${vehicule.modele}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {displayImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {displayImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveImage(i) }}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? 'bg-white w-6' : 'bg-white/30'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Essai Modal */}
      {essaiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !submitting && setEssaiOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Réserver un essai</h3>
                <button
                  onClick={() => !submitting && setEssaiOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  disabled={submitting}
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-6">
                <div className="font-bold text-gray-900">{vehicule.marque} {vehicule.modele}</div>
                <div className="text-sm text-gray-400">{vehicule.annee} · <span className="font-normal">À partir de </span>{Number(vehicule.prix).toLocaleString('fr-FR')} MAD</div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date et heure souhaitées</label>
                <input
                  type="datetime-local"
                  value={essaiDate}
                  onChange={(e) => setEssaiDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => !submitting && setEssaiOpen(false)}
                  className="btn-outline flex-1"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  onClick={handleEssai}
                  disabled={submitting || !essaiDate}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Envoi...' : "Confirmer l'essai"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
