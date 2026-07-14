import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUTS = ['DISPONIBLE', 'EN_REVISION', 'VENDU'];

const VehiculesPage = () => {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/vehicules', { params: { statut: 'EN_REVISION', limit: 200 } });
      setVehicules(res.data.data.vehicules || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicules(); }, []);

  const handleStatutChange = async (id, newStatut) => {
    try {
      await api.put(`/api/vehicules/${id}`, { statut: newStatut });
      toast.success('Statut mis à jour');
      setVehicules(prev => prev.map(v => v.id === id ? { ...v, statut: newStatut } : v).filter(v => v.statut === 'EN_REVISION'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const statutBadge = (statut) => {
    const cls = {
      DISPONIBLE: 'bg-green-100 text-green-700',
      EN_REVISION: 'bg-yellow-100 text-yellow-700',
      VENDU: 'bg-gray-100 text-gray-700',
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
      <h1 className="text-3xl font-bold mb-6">Véhicules en Atelier</h1>

      {vehicules.length === 0 ? (
        <p className="text-gray-400">Aucun véhicule en révision.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Marque</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Modèle</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Année</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Kilométrage</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Statut actuel</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Changer statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vehicules.map(v => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{v.marque}</td>
                  <td className="px-4 py-3 text-sm">{v.modele}</td>
                  <td className="px-4 py-3 text-sm">{v.annee}</td>
                  <td className="px-4 py-3 text-sm">{v.kilometrage?.toLocaleString('fr-FR')} km</td>
                  <td className="px-4 py-3 text-sm">{statutBadge(v.statut)}</td>
                  <td className="px-4 py-3 text-sm">
                    <select value={v.statut} onChange={(e) => handleStatutChange(v.id, e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition">
                      {STATUTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
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

export default VehiculesPage;
