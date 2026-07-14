import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CalendrierPage = () => {
  const [rdv, setRdv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBloquer, setShowBloquer] = useState(false);
  const [bloquerForm, setBloquerForm] = useState({ debut: '', fin: '', motif: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchRdv = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/rdv/jour');
      setRdv(res.data.data.rdv || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRdv(); }, []);

  const handleStatut = async (id, statut) => {
    try {
      await api.put(`/api/rdv/${id}/statut`, { statut });
      toast.success(`RDV ${statut === 'CONFIRME' ? 'confirmé' : statut === 'REFUSE' ? 'refusé' : 'terminé'}`);
      fetchRdv();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleBloquer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/plages', {
        debut: new Date(bloquerForm.debut).toISOString(),
        fin: new Date(bloquerForm.fin).toISOString(),
        motif: bloquerForm.motif,
      });
      toast.success('Créneau bloqué');
      setShowBloquer(false);
      setBloquerForm({ debut: '', fin: '', motif: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
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
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${cls[statut] || 'bg-gray-100 text-gray-700'}`}>
        {statut.replace('_', ' ')}
      </span>
    );
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Calendrier — RDV du jour</h1>
        <button onClick={() => setShowBloquer(!showBloquer)}
          className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#333] text-white text-sm font-medium rounded-lg transition-colors">
          {showBloquer ? 'Annuler' : 'Bloquer un créneau'}
        </button>
      </div>

      {showBloquer && (
        <form onSubmit={handleBloquer} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4 max-w-lg">
          <h2 className="text-lg font-semibold">Bloquer un créneau</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date / heure début</label>
            <input type="datetime-local" value={bloquerForm.debut} onChange={(e) => setBloquerForm({ ...bloquerForm, debut: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date / heure fin</label>
            <input type="datetime-local" value={bloquerForm.fin} onChange={(e) => setBloquerForm({ ...bloquerForm, fin: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
            <input type="text" value={bloquerForm.motif} onChange={(e) => setBloquerForm({ ...bloquerForm, motif: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
          </div>
          <button type="submit" disabled={submitting}
            className="bg-[#CC0000] hover:bg-[#a30000] text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm disabled:opacity-50">
            {submitting ? 'Blocage...' : 'Bloquer'}
          </button>
        </form>
      )}

      {rdv.length === 0 ? (
        <p className="text-gray-400">Aucun rendez-vous aujourd'hui.</p>
      ) : (
        <div className="space-y-3">
          {rdv.map(r => (
            <div key={r.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-bold text-[#CC0000]">
                      {new Date(r.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">{r.motif}</p>
                    <p className="text-sm text-gray-500">{r.client?.prenom} {r.client?.nom} — {r.client?.telephone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {statutBadge(r.statut)}
                  {r.statut === 'EN_ATTENTE' && (
                    <div className="flex gap-1">
                      <button onClick={() => handleStatut(r.id, 'CONFIRME')}
                        className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200">
                        Confirmer
                      </button>
                      <button onClick={() => handleStatut(r.id, 'REFUSE')}
                        className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200">
                        Refuser
                      </button>
                    </div>
                  )}
                  {r.statut === 'CONFIRME' && (
                    <button onClick={() => handleStatut(r.id, 'TERMINE')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200">
                      Terminer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendrierPage;
