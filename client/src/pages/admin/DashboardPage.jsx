import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DashboardPage = () => {
  const [clients, setClients] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [rdv, setRdv] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cliRes, vehRes, rdvRes] = await Promise.all([
          api.get('/api/clients').catch(() => ({ data: { data: { clients: [] } } })),
          api.get('/api/vehicules', { params: { limit: 500 } }).catch(() => ({ data: { data: { vehicules: [] } } })),
          api.get('/api/rdv/jour').catch(() => ({ data: { data: { rdv: [] } } })),
        ]);
        setClients(cliRes.data.data.clients || []);
        setVehicules(vehRes.data.data.vehicules || []);
        setRdv(rdvRes.data.data.rdv || []);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const clientsActifs = clients.filter(c => c.actif).length;
  const vehStats = {
    DISPONIBLE: vehicules.filter(v => v.statut === 'DISPONIBLE').length,
    EN_REVISION: vehicules.filter(v => v.statut === 'EN_REVISION').length,
    VENDU: vehicules.filter(v => v.statut === 'VENDU').length,
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Clients</h3>
          <p className="text-3xl font-bold text-[#CC0000]">{clients.length}</p>
          <p className="text-gray-500 text-sm">{clientsActifs} actifs</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">RDV aujourd'hui</h3>
          <p className="text-3xl font-bold text-blue-600">{rdv.length}</p>
          <p className="text-gray-500 text-sm">ce mois</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Disponibles</h3>
          <p className="text-3xl font-bold text-green-600">{vehStats.DISPONIBLE}</p>
          <p className="text-gray-500 text-sm">véhicules</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-1">En révision</h3>
          <p className="text-3xl font-bold text-yellow-600">{vehStats.EN_REVISION}</p>
          <p className="text-gray-500 text-sm">véhicules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Répartition véhicules</h2>
          <div className="bg-white rounded-lg shadow p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Disponibles</span>
              <span className="text-sm font-medium text-green-600">{vehStats.DISPONIBLE}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${vehicules.length ? (vehStats.DISPONIBLE / vehicules.length * 100) : 0}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En révision</span>
              <span className="text-sm font-medium text-yellow-600">{vehStats.EN_REVISION}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${vehicules.length ? (vehStats.EN_REVISION / vehicules.length * 100) : 0}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vendus</span>
              <span className="text-sm font-medium text-gray-600">{vehStats.VENDU}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${vehicules.length ? (vehStats.VENDU / vehicules.length * 100) : 0}%` }} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Répartition utilisateurs</h2>
          <div className="bg-white rounded-lg shadow p-5 space-y-3">
            {['CLIENT', 'COMMERCIAL', 'CHEF_ATELIER', 'ADMIN'].map(role => {
              const count = clients.filter(c => c.role === role).length;
              return (
                <div key={role}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{role.replace('_', ' ')}</span>
                    <span className="text-sm font-medium text-gray-800">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#CC0000] h-2 rounded-full" style={{ width: `${clients.length ? (count / clients.length * 100) : 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
