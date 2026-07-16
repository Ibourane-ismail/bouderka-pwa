import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'

const brandConfig = {
  volkswagen: { name: 'Volkswagen', apiMarque: 'VOLKSWAGEN', color: '#001E50' },
  skoda: { name: 'Škoda', apiMarque: 'SKODA', color: '#4BA82E' },
  audi: { name: 'Audi', apiMarque: 'AUDI', color: '#BB0A30' },
  porsche: { name: 'Porsche', apiMarque: null, color: '#A30000' },
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Marque inconnue</h1>
          <Link to="/" className="text-primary font-semibold hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />

      {/* Hero section */}
      <section className="pt-24 lg:pt-28 pb-12 lg:pb-16" style={{ backgroundColor: config.color }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/" className="text-white/60 hover:text-white text-sm transition-colors">
              Accueil
            </Link>
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white text-sm font-medium">{config.name}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Catalogue {config.name}
          </h1>
          <p className="mt-3 text-white/70 text-lg max-w-xl">
            Découvrez notre sélection de véhicules {config.name}.
          </p>
        </div>
      </section>

      {/* Brand nav */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-3 overflow-x-auto">
            {Object.entries(brandConfig).filter(([k]) => k !== marque).map(([slug, b]) => (
              <Link
                key={slug}
                to={`/catalogue/${slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicles grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : vehicules.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun véhicule disponible</h3>
              <p className="text-gray-400 mb-6">
                Aucun véhicule disponible pour cette marque.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-blue-800 transition-colors shadow-sm"
              >
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <span className="text-gray-400 text-sm font-medium">
                  {vehicules.length} véhicule{vehicules.length > 1 ? 's' : ''} disponible{vehicules.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicules.map((v) => (
                  <div
                    key={v.id}
                    className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                      {v.images && v.images.length > 0 ? (
                        <img
                          src={v.images[0]}
                          alt={`${v.marque} ${v.modele}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-extrabold text-gray-200">{v.marque}</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-900 shadow-sm">
                          DISPONIBLE
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-1">{v.marque} {v.modele}</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        {v.annee} · {v.kilometrage?.toLocaleString('fr-FR')} km · {v.carburant}
                      </p>
                      <p className="text-gray-400 text-sm mb-4">{v.transmission}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          {Number(v.prix).toLocaleString('fr-FR')} MAD
                        </span>
                        {v.prixPromo && (
                          <span className="text-sm text-gray-400 line-through">
                            {Number(v.prixPromo).toLocaleString('fr-FR')} MAD
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xl font-extrabold text-white tracking-tight">Bouderka</span>
          <p className="mt-3 text-sm">&copy; {new Date().getFullYear()} Bouderka SARL. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
