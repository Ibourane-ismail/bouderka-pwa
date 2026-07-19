import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Logo from '../../components/Logo'
import toast from 'react-hot-toast'

const MARQUES = ['', 'VOLKSWAGEN', 'AUDI', 'SKODA']

const EQUIPMENT_ICONS = {
  GPS: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  Bluetooth: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  'Apple CarPlay': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  'Caméra de recul': 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  'Jantes alliage': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'Climatisation automatique': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  'Toit panoramique': 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
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

function VehiclePlaceholder({ marque, className = '' }) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      <span className="text-5xl font-black text-gray-200 select-none tracking-tighter">{marque}</span>
    </div>
  )
}

const CataloguePage = () => {
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)
  const [marque, setMarque] = useState('')
  const [prixMax, setPrixMax] = useState('')
  const [testDriveId, setTestDriveId] = useState(null)
  const [testDriveDate, setTestDriveDate] = useState('')

  const fetchVehicules = async () => {
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
  }

  useEffect(() => { fetchVehicules() }, [marque, prixMax])

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
    <div className="space-y-8">
      <h1 className="section-title">Catalogue</h1>

      <div className="flex flex-wrap gap-3">
        <select value={marque} onChange={(e) => setMarque(e.target.value)} className="form-select w-auto min-w-[180px]">
          <option value="">Toutes les marques</option>
          {MARQUES.filter(Boolean).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          type="number"
          placeholder="Prix max (MAD)"
          value={prixMax}
          onChange={(e) => setPrixMax(e.target.value)}
          className="form-input w-48"
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
      ) : vehicules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="empty-state-title">Aucun véhicule disponible</h3>
          <p className="empty-state-text">Modifiez vos filtres pour voir plus de résultats.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {vehicules.map(v => {
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
                        {Number(v.prix).toLocaleString('fr-FR')} <span className="text-sm font-semibold text-gray-400">MAD</span>
                      </span>
                    </div>
                  </Link>

                  {testDriveId === v.id ? (
                    <div className="mt-4 flex gap-2">
                      <input type="datetime-local" value={testDriveDate} onChange={(e) => setTestDriveDate(e.target.value)} className="form-input flex-1" />
                      <button onClick={() => handleTestDrive(v.id)} className="btn-primary px-4 text-xs">OK</button>
                      <button onClick={() => setTestDriveId(null)} className="btn-outline px-3 text-xs">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setTestDriveId(v.id)} className="mt-4 w-full btn-primary text-sm">
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
      )}
    </div>
  )
}

export default CataloguePage
