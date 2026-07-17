import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import StatutBadge from '../../components/StatutBadge'

const CalendrierPage = () => {
  const [rdv, setRdv] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBloquer, setShowBloquer] = useState(false)
  const [bloquerForm, setBloquerForm] = useState({ debut: '', fin: '', motif: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchRdv = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/rdv/jour')
      setRdv(res.data.data.rdv || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRdv() }, [])

  const handleStatut = async (id, statut) => {
    try {
      await api.put(`/api/rdv/${id}/statut`, { statut })
      toast.success(`RDV ${statut === 'CONFIRME' ? 'confirmé' : statut === 'REFUSE' ? 'refusé' : 'terminé'}`)
      fetchRdv()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const handleBloquer = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/plages', {
        debut: new Date(bloquerForm.debut).toISOString(),
        fin: new Date(bloquerForm.fin).toISOString(),
        motif: bloquerForm.motif,
      })
      toast.success('Créneau bloqué')
      setShowBloquer(false)
      setBloquerForm({ debut: '', fin: '', motif: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="skeleton h-12 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-20" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Calendrier</h1>
          <p className="text-sm text-gray-400 mt-1">Rendez-vous du jour</p>
        </div>
        <button onClick={() => setShowBloquer(!showBloquer)}
          className={showBloquer ? 'btn-outline' : 'btn-primary'}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          {showBloquer ? 'Annuler' : 'Bloquer un créneau'}
        </button>
      </div>

      {showBloquer && (
        <div className="content-card p-6">
          <form onSubmit={handleBloquer} className="max-w-lg space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Bloquer un créneau</h2>
            <div>
              <label className="form-label">Date / heure début</label>
              <input type="datetime-local" value={bloquerForm.debut} onChange={(e) => setBloquerForm({ ...bloquerForm, debut: e.target.value })} required className="form-input" />
            </div>
            <div>
              <label className="form-label">Date / heure fin</label>
              <input type="datetime-local" value={bloquerForm.fin} onChange={(e) => setBloquerForm({ ...bloquerForm, fin: e.target.value })} required className="form-input" />
            </div>
            <div>
              <label className="form-label">Motif</label>
              <input type="text" value={bloquerForm.motif} onChange={(e) => setBloquerForm({ ...bloquerForm, motif: e.target.value })} required className="form-input" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Blocage...' : 'Bloquer'}
            </button>
          </form>
        </div>
      )}

      {rdv.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="empty-state-title">Aucun rendez-vous</h3>
          <p className="empty-state-text">Aucun rendez-vous aujourd'hui.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {rdv.map((r, i) => {
            const statusActions = []
            if (r.statut === 'EN_ATTENTE') {
              statusActions.push(
                <button key="confirm" onClick={() => handleStatut(r.id, 'CONFIRME')}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors">Confirmer</button>,
                <button key="refuse" onClick={() => handleStatut(r.id, 'REFUSE')}
                  className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">Refuser</button>,
              )
            } else if (r.statut === 'CONFIRME') {
              statusActions.push(
                <button key="termine" onClick={() => handleStatut(r.id, 'TERMINE')}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">Terminer</button>,
              )
            }
            return (
              <div key={r.id} className="content-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="min-w-[64px]">
                      <p className="text-xl font-extrabold text-accent tracking-tight">
                        {new Date(r.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{r.motif}</p>
                      <p className="text-sm text-gray-500">{r.client?.prenom} {r.client?.nom}</p>
                      {r.client?.telephone && (
                        <p className="text-sm text-gray-400">{r.client.telephone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatutBadge statut={r.statut} />
                    {statusActions.length > 0 && (
                      <div className="flex gap-1">{statusActions}</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CalendrierPage
