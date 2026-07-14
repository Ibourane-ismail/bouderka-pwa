import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DashboardPage = () => {
  const [rdvJour, setRdvJour] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rdvRes, vehRes] = await Promise.all([
          api.get('/api/rdv/jour').catch(() => ({ data: { data: { rdv: [] } } })),
          api.get('/api/vehicules', { params: { statut: 'EN_REVISION', limit: 200 } }).catch(() => ({ data: { data: { vehicules: [] } } })),
        ]);
        setRdvJour(rdvRes.data.data.rdv || []);
        setVehicules(vehRes.data.data.vehicules || []);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const rdvEnAttente = rdvJour.filter(r => r.statut === 'EN_ATTENTE').length;
  const rdvConfirme = rdvJour.filter(r => r.statut === 'CONFIRME').length;

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Atelier</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">RDV du jour</h3>
          <p className="text-3xl font-bold text-[#CC0000]">{rdvJour.length}</p>
          <p className="text-gray-500 text-sm">{rdvConfirme} confirmés</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">RDV en attente</h3>
          <p className="text-3xl font-bold text-yellow-600">{rdvEnAttente}</p>
          <p className="text-gray-500 text-sm">à confirmer</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Véhicules en révision</h3>
          <p className="text-3xl font-bold text-blue-600">{vehicules.length}</p>
          <p className="text-gray-500 text-sm">en cours</p>
        </div>
      </div>

      {rdvJour.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Prochains RDV</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Heure</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Client</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Motif</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rdvJour.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-sm font-medium">
                      {new Date(r.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-sm">{r.client?.prenom} {r.client?.nom}</td>
                    <td className="px-4 py-3 text-sm">{r.motif}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        r.statut === 'CONFIRME' ? 'bg-green-100 text-green-700' :
                        r.statut === 'REFUSE' ? 'bg-red-100 text-red-700' :
                        r.statut === 'TERMINE' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{r.statut.replace('_', ' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
