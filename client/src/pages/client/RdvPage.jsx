import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MOTIFS = ['Vidange', 'Révision', 'Contrôle technique', 'Réparation', 'Autre'];

const RdvPage = () => {
  const [rdv, setRdv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creneaux, setCreneaux] = useState([]);
  const [form, setForm] = useState({ date: '', heure: '', motif: '', notes: '' });

  const fetchRdv = async () => {
    try {
      const res = await api.get('/api/rdv/mes-rdv');
      setRdv(res.data.data.rdv || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRdv(); }, []);

  const fetchCreneaux = async (date) => {
    try {
      const res = await api.get(`/api/rdv/creneaux-libres?date=${date}`);
      setCreneaux(res.data.data.creneaux || []);
    } catch (err) {
      setCreneaux([]);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setForm({ ...form, date, heure: '' });
    if (date) fetchCreneaux(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dateHeure = new Date(`${form.date}T${form.heure}`);
      await api.post('/api/rdv', { clientId: (await api.get('/api/auth/me')).data.data.user.id, dateHeure: dateHeure.toISOString(), motif: form.motif, notes: form.notes });
      toast.success('Rendez-vous créé');
      setShowForm(false);
      setForm({ date: '', heure: '', motif: '', notes: '' });
      fetchRdv();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const statutBadge = (statut) => {
    const cls = {
      CONFIRME: 'bg-green-100 text-green-700',
      REFUSE: 'bg-red-100 text-red-700',
      ANNULE: 'bg-red-100 text-red-700',
      TERMINE: 'bg-gray-100 text-gray-700',
      EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
    };
    return <span className={`px-2 py-0.5 text-xs rounded-full ${cls[statut] || 'bg-gray-100 text-gray-700'}`}>{statut.replace('_', ' ')}</span>;
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mes Rendez-vous</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {showForm ? 'Annuler' : 'Nouveau RDV'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={handleDateChange} required
              className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
            <select value={form.heure} onChange={(e) => setForm({ ...form, heure: e.target.value })} required
              className="w-full border rounded px-3 py-2">
              <option value="">Choisir un créneau</option>
              {creneaux.map((c, i) => {
                const h = new Date(c);
                return <option key={i} value={h.toTimeString().slice(0, 5)}>{h.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
            <select value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} required
              className="w-full border rounded px-3 py-2">
              <option value="">Choisir un motif</option>
              {MOTIFS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Confirmer</button>
        </form>
      )}

      {rdv.length === 0 ? (
        <p className="text-gray-400">Aucun rendez-vous.</p>
      ) : (
        <div className="space-y-3">
          {rdv.map(r => (
            <div key={r.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{r.motif}</p>
                <p className="text-sm text-gray-500">{new Date(r.dateHeure).toLocaleString('fr-FR')}</p>
              </div>
              {statutBadge(r.statut)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RdvPage;
