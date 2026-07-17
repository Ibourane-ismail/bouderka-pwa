import { useState, useEffect } from 'react'
import api from '../../services/api'

const HistoriquePage = () => {
  const [entretiens, setEntretiens] = useState([])
  const [loading, setLoading] = useState(true)
  const [alertes, setAlertes] = useState([])

  useEffect(() => {
    const fetchEntretiens = async () => {
      try {
        const res = await api.get('/api/entretien/mes-entretiens')
        const data = res.data.data.entretiens || []
        setEntretiens(data)

        const now = new Date()
        const newAlertes = []
        data.forEach(e => {
          if (e.prochainVideange && e.prochainVideange < 500) {
            newAlertes.push({ id: e.id + '_v', type: 'urgent', message: `Vidange dans ${e.prochainVideange} km — ${e.vehicule?.marque} ${e.vehicule?.modele}` })
          }
          if (e.prochainControle) {
            const diff = (new Date(e.prochainControle) - now) / (1000 * 60 * 60 * 24)
            if (diff < 30) {
              newAlertes.push({
                id: e.id + '_c',
                type: diff < 7 ? 'urgent' : 'warning',
                message: `Contrôle technique dans ${Math.ceil(diff)} jours — ${e.vehicule?.marque} ${e.vehicule?.modele}`,
              })
            }
          }
        })
        setAlertes(newAlertes)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchEntretiens()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-24" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="section-title">Historique des entretiens</h1>

      {alertes.length > 0 && (
        <div className="space-y-2">
          {alertes.map(a => (
            <div key={a.id} className={a.type === 'urgent' ? 'alert-urgent' : 'alert-warning'}>
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
              </svg>
              <p className="font-medium">{a.message}</p>
            </div>
          ))}
        </div>
      )}

      {entretiens.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="empty-state-title">Aucun entretien</h3>
          <p className="empty-state-text">Votre historique d'entretien est vide.</p>
        </div>
      ) : (
        <div className="relative ml-6 space-y-8">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />

          {entretiens.map((e, i) => (
            <div key={e.id} className="relative pl-8">
              <div className={`absolute left-[-9px] top-1 w-[18px] h-[18px] rounded-full border-[3px] border-white shadow-sm ${
                i === 0 ? 'bg-accent' : 'bg-gray-300'
              }`} />
              <div className="content-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{e.typeService}</h3>
                  <span className="text-sm text-gray-400">{new Date(e.dateService).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</span>
                </div>
                {e.vehicule && (
                  <p className="text-sm text-gray-600 font-medium">{e.vehicule.marque} {e.vehicule.modele} ({e.vehicule.annee})</p>
                )}
                {e.immatriculation && <p className="text-sm text-gray-400">Immatriculation: {e.immatriculation}</p>}
                {e.description && <p className="text-sm text-gray-600 mt-2">{e.description}</p>}
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {e.kilometrageService.toLocaleString('fr-FR')} km
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HistoriquePage
