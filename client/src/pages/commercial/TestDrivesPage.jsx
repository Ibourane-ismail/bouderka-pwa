import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TestDrivesPage = () => {
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchTestDrives = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/testdrive', { params: { limit: 200 } });
      setTestDrives(res.data.data.testDrives || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTestDrives(); }, []);

  const handleStatut = async (id, statut) => {
    try {
      await api.put(`/api/testdrive/${id}/statut`, { statut });
      toast.success(statut === 'APPROUVE' ? 'Test drive approuvé' : 'Test drive refusé');
      setConfirmAction(null);
      fetchTestDrives();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const statutBadge = (statut) => {
    const cls = {
      EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
      APPROUVE: 'bg-green-100 text-green-700',
      REFUSE: 'bg-red-100 text-red-700',
      EFFECTUE: 'bg-gray-100 text-gray-700',
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
      <h1 className="text-3xl font-bold mb-6">Demandes de Test Drive</h1>

      {testDrives.length === 0 ? (
        <p className="text-gray-400">Aucune demande de test drive.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Véhicule</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Date souhaitée</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Statut</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {testDrives.map(td => (
                <tr key={td.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <p className="font-medium">{td.client?.prenom} {td.client?.nom}</p>
                    <p className="text-gray-500 text-xs">{td.client?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {td.vehicule?.marque} {td.vehicule?.modele} ({td.vehicule?.annee})
                  </td>
                  <td className="px-4 py-3 text-sm">{new Date(td.dateHeure).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3 text-sm">{statutBadge(td.statut)}</td>
                  <td className="px-4 py-3 text-sm">
                    {td.statut === 'EN_ATTENTE' ? (
                      confirmAction?.id === td.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleStatut(td.id, confirmAction.action)}
                            className={`px-3 py-1 text-white text-xs rounded ${
                              confirmAction.action === 'APPROUVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                            }`}>
                            Confirmer
                          </button>
                          <button onClick={() => setConfirmAction(null)}
                            className="px-3 py-1 bg-gray-300 text-xs rounded hover:bg-gray-400">
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmAction({ id: td.id, action: 'APPROUVE' })}
                            className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200">
                            Approuver
                          </button>
                          <button onClick={() => setConfirmAction({ id: td.id, action: 'REFUSE' })}
                            className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200">
                            Refuser
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestDrivesPage;
