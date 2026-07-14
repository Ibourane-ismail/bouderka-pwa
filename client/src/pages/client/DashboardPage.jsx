import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DashboardPage = () => {
  const [rdv, setRdv] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [entretiens, setEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rdvRes, notifRes, entRes] = await Promise.all([
          api.get('/api/rdv/mes-rdv').catch(() => ({ data: { data: { rdv: [] } } })),
          api.get('/api/notifications').catch(() => ({ data: { data: { notifications: [] } } })),
          api.get('/api/entretien/mes-entretiens').catch(() => ({ data: { data: { entretiens: [] } } })),
        ]);
        setRdv(rdvRes.data.data.rdv || []);
        setNotifications(notifRes.data.data.notifications || []);
        setEntretiens(entRes.data.data.entretiens || []);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const prochainRdv = rdv.find(r => r.statut === 'EN_ATTENTE' || r.statut === 'CONFIRME');
  const nonLues = notifications.filter(n => !n.lue).length;

  const alertes = [];
  const now = new Date();
  entretiens.forEach(e => {
    if (e.prochainVideange) {
      alertes.push({ type: 'Vidange', message: `Prochaine vidange dans ${e.prochainVideange} km`, urgente: e.prochainVideange < 500 });
    }
    if (e.prochainControle) {
      const diff = (new Date(e.prochainControle) - now) / (1000 * 60 * 60 * 24);
      if (diff < 30) {
        alertes.push({ type: 'Contrôle technique', message: `Contrôle technique dans ${Math.ceil(diff)} jours`, urgente: diff < 7 });
      }
    }
  });

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Client</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Prochain RDV</h3>
          {prochainRdv ? (
            <div>
              <p className="text-lg font-semibold">{prochainRdv.motif}</p>
              <p className="text-gray-600">{new Date(prochainRdv.dateHeure).toLocaleString('fr-FR')}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                prochainRdv.statut === 'CONFIRME' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>{prochainRdv.statut}</span>
            </div>
          ) : (
            <p className="text-gray-400">Aucun RDV prévu</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Notifications</h3>
          <p className="text-3xl font-bold text-blue-600">{nonLues}</p>
          <p className="text-gray-500 text-sm">non lues</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Entretiens</h3>
          <p className="text-3xl font-bold text-gray-700">{entretiens.length}</p>
          <p className="text-gray-500 text-sm">au total</p>
        </div>
      </div>

      {alertes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Alertes</h2>
          <div className="space-y-2">
            {alertes.map((a, i) => (
              <div key={i} className={`flex items-center gap-2 p-3 rounded-lg ${
                a.urgente ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
              }`}>
                <span className={`text-lg ${a.urgente ? 'text-red-500' : 'text-orange-500'}`}>!</span>
                <span className={a.urgente ? 'text-red-700 font-medium' : 'text-orange-700'}>{a.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-3">Derniers RDV</h2>
        {rdv.length === 0 ? (
          <p className="text-gray-400">Aucun rendez-vous.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Motif</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rdv.slice(0, 5).map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-sm">{new Date(r.dateHeure).toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-sm">{r.motif}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        r.statut === 'CONFIRME' ? 'bg-green-100 text-green-700' :
                        r.statut === 'REFUSE' || r.statut === 'ANNULE' ? 'bg-red-100 text-red-700' :
                        r.statut === 'TERMINE' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{r.statut.replace('_', ' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
