import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import StatutBadge from '../../components/StatutBadge'
import DataTable from '../../components/DataTable'

const MOTIFS = ['Vidange', 'Révision', 'Contrôle technique', 'Réparation', 'Autre']

const RdvPage = () => {
  const [rdv, setRdv] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creneaux, setCreneaux] = useState([])
  const [form, setForm] = useState({ date: '', heure: '', motif: '', notes: '' })

  const fetchRdv = async () => {
    try {
      const res = await api.get('/api/rdv/mes-rdv')
      setRdv(res.data.data.rdv || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRdv() }, [])

  const fetchCreneaux = async (date) => {
    try {
      const res = await api.get(`/api/rdv/creneaux-libres?date=${date}`)
      setCreneaux(res.data.data.creneaux || [])
    } catch (err) {
      setCreneaux([])
    }
  }

  const handleDateChange = (e) => {
    const date = e.target.value
    setForm({ ...form, date, heure: '' })
    if (date) fetchCreneaux(date)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dateHeure = new Date(`${form.date}T${form.heure}`)
      await api.post('/api/rdv', { clientId: (await api.get('/api/auth/me')).data.data.user.id, dateHeure: dateHeure.toISOString(), motif: form.motif, notes: form.notes })
      toast.success('Rendez-vous créé')
      setShowForm(false)
      setForm({ date: '', heure: '', motif: '', notes: '' })
      fetchRdv()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="skeleton h-12 w-40" />
        <div className="skeleton h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Mes rendez-vous</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? 'btn-outline' : 'btn-primary'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          {showForm ? 'Annuler' : 'Nouveau RDV'}
        </button>
      </div>

      {showForm && (
        <div className="content-card p-6">
          <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Nouveau rendez-vous</h2>
            <div>
              <label className="form-label">Date</label>
              <input type="date" value={form.date} onChange={handleDateChange} required className="form-input" />
            </div>
            <div>
              <label className="form-label">Heure</label>
              <select value={form.heure} onChange={(e) => setForm({ ...form, heure: e.target.value })} required className="form-select">
                <option value="">Choisir un créneau</option>
                {creneaux.map((c, i) => {
                  const h = new Date(c)
                  return <option key={i} value={h.toTimeString().slice(0, 5)}>{h.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</option>
                })}
              </select>
            </div>
            <div>
              <label className="form-label">Motif</label>
              <select value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} required className="form-select">
                <option value="">Choisir un motif</option>
                {MOTIFS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Notes (optionnel)</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="form-input" rows={3} />
            </div>
            <button type="submit" className="btn-primary w-full">Confirmer le rendez-vous</button>
          </form>
        </div>
      )}

      <DataTable
        columns={[
          {
            key: 'date', label: 'Date & heure',
            render: (r) => new Date(r.dateHeure).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }),
          },
          { key: 'motif', label: 'Motif' },
          { key: 'statut', label: 'Statut', render: (r) => <StatutBadge statut={r.statut} /> },
        ]}
        data={rdv}
        renderMobileCard={(r) => (
          <div key={r.id} className="content-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-900">{r.motif}</span>
              <StatutBadge statut={r.statut} />
            </div>
            <p className="text-sm text-gray-500">{new Date(r.dateHeure).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
          </div>
        )}
      />
    </div>
  )
}

export default RdvPage
