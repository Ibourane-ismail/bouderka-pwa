import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DashboardPage = () => {
  const [vehicules, setVehicules] = useState([]);
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehRes, tdRes] = await Promise.all([
          api.get('/api/vehicules', { params: { statut: 'DISPONIBLE', limit: 200 } }).catch(() => ({ data: { data: { vehicules: [] } } })),
          api.get('/api/testdrive', { params: { statut: 'EN_ATTENTE', limit: 200 } }).catch(() => ({ data: { data: { testDrives: [] } } })),
        ]);
        setVehicules(vehRes.data.data.vehicules || []);
        setTestDrives(tdRes.data.data.testDrives || []);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Commercial</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Véhicules disponibles</h3>
          <p className="text-3xl font-bold text-[#CC0000]">{vehicules.length}</p>
          <p className="text-gray-500 text-sm">dans le catalogue</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Test drives en attente</h3>
          <p className="text-3xl font-bold text-yellow-600">{testDrives.length}</p>
          <p className="text-gray-500 text-sm">à traiter</p>
        </div>
      </div>

      {testDrives.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Dernières demandes de test drive</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Client</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Véhicule</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Date souhaitée</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {testDrives.slice(0, 5).map(td => (
                  <tr key={td.id}>
                    <td className="px-4 py-3 text-sm">{td.client?.prenom} {td.client?.nom}</td>
                    <td className="px-4 py-3 text-sm">{td.vehicule?.marque} {td.vehicule?.modele}</td>
                    <td className="px-4 py-3 text-sm">{new Date(td.dateHeure).toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">EN ATTENTE</span>
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
