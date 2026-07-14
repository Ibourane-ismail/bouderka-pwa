import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MARQUES = ['', 'VOLKSWAGEN', 'AUDI', 'SKODA'];

const CataloguePage = () => {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marque, setMarque] = useState('');
  const [prixMax, setPrixMax] = useState('');
  const [testDriveId, setTestDriveId] = useState(null);
  const [testDriveDate, setTestDriveDate] = useState('');

  const fetchVehicules = async () => {
    setLoading(true);
    try {
      const params = { statut: 'DISPONIBLE' };
      if (marque) params.marque = marque;
      if (prixMax) params.prixMax = prixMax;
      const res = await api.get('/api/vehicules', { params });
      setVehicules(res.data.data.vehicules || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicules(); }, [marque, prixMax]);

  const handleTestDrive = async (vehiculeId) => {
    if (!testDriveDate) {
      toast.error('Sélectionnez une date');
      return;
    }
    try {
      await api.post('/api/testdrive', { vehiculeId, dateHeure: new Date(testDriveDate).toISOString() });
      toast.success('Demande de test drive envoyée');
      setTestDriveId(null);
      setTestDriveDate('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Catalogue</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={marque} onChange={(e) => setMarque(e.target.value)}
          className="border rounded px-3 py-2 text-sm">
          <option value="">Toutes les marques</option>
          {MARQUES.filter(Boolean).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="number" placeholder="Prix max (€)" value={prixMax} onChange={(e) => setPrixMax(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-40" />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Chargement...</div>
      ) : vehicules.length === 0 ? (
        <p className="text-gray-400">Aucun véhicule disponible.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicules.map(v => (
            <div key={v.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400">
                {v.images && v.images.length > 0 ? (
                  <img src={v.images[0]} alt={`${v.marque} ${v.modele}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{v.marque}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{v.marque} {v.modele}</h3>
                <p className="text-sm text-gray-500">{v.annee} — {v.kilometrage?.toLocaleString('fr-FR')} km</p>
                <p className="text-sm text-gray-500">{v.carburant} — {v.transmission}</p>
                <p className="text-xl font-bold text-blue-600 mt-2">{Number(v.prix).toLocaleString('fr-FR')} €</p>

                {testDriveId === v.id ? (
                  <div className="mt-3 flex gap-2">
                    <input type="datetime-local" value={testDriveDate} onChange={(e) => setTestDriveDate(e.target.value)}
                      className="border rounded px-2 py-1 text-sm flex-1" />
                    <button onClick={() => handleTestDrive(v.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">OK</button>
                    <button onClick={() => setTestDriveId(null)}
                      className="px-3 py-1 bg-gray-300 text-sm rounded hover:bg-gray-400">X</button>
                  </div>
                ) : (
                  <button onClick={() => setTestDriveId(v.id)}
                    className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Demander un test drive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CataloguePage;
