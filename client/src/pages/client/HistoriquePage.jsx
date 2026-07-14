import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const HistoriquePage = () => {
  const [entretiens, setEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertes, setAlertes] = useState([]);

  useEffect(() => {
    const fetchEntretiens = async () => {
      try {
        const res = await api.get('/api/entretien/mes-entretiens');
        const data = res.data.data.entretiens || [];
        setEntretiens(data);

        const now = new Date();
        const newAlertes = [];
        data.forEach(e => {
          if (e.prochainVideange && e.prochainVideange < 500) {
            newAlertes.push({ id: e.id + '_v', type: 'urgent', message: `Vidange dans ${e.prochainVideange} km — ${e.vehicule?.marque} ${e.vehicule?.modele}` });
          }
          if (e.prochainControle) {
            const diff = (new Date(e.prochainControle) - now) / (1000 * 60 * 60 * 24);
            if (diff < 30) {
              newAlertes.push({ id: e.id + '_c', type: diff < 7 ? 'urgent' : 'warning', message: `Contrôle technique dans ${Math.ceil(diff)} jours — ${e.vehicule?.marque} ${e.vehicule?.modele}` });
            }
          }
        });
        setAlertes(newAlertes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntretiens();
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Historique des Entretiens</h1>

      {alertes.length > 0 && (
        <div className="mb-6 space-y-2">
          {alertes.map(a => (
            <div key={a.id} className={`flex items-center gap-2 p-3 rounded-lg ${
              a.type === 'urgent' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-orange-50 border border-orange-200 text-orange-700'
            }`}>
              <span className="font-bold">!</span>
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      )}

      {entretiens.length === 0 ? (
        <p className="text-gray-400">Aucun entretien enregistré.</p>
      ) : (
        <div className="relative border-l-2 border-gray-200 ml-4 space-y-6">
          {entretiens.map((e, i) => (
            <div key={e.id} className="relative pl-8">
              <div className={`absolute -left-2.5 top-1 w-4 h-4 rounded-full border-2 border-white ${
                i === 0 ? 'bg-blue-500' : 'bg-gray-400'
              }`} />
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold">{e.typeService}</p>
                  <span className="text-sm text-gray-500">{new Date(e.dateService).toLocaleDateString('fr-FR')}</span>
                </div>
                {e.vehicule && (
                  <p className="text-sm text-gray-600">{e.vehicule.marque} {e.vehicule.modele} ({e.vehicule.annee})</p>
                )}
                {e.immatriculation && <p className="text-sm text-gray-500">Immat: {e.immatriculation}</p>}
                {e.description && <p className="text-sm text-gray-600 mt-1">{e.description}</p>}
                <p className="text-sm text-gray-500 mt-1">{e.kilometrageService.toLocaleString('fr-FR')} km</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoriquePage;
