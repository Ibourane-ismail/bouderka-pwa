import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MARQUES = ['VOLKSWAGEN', 'AUDI', 'SKODA'];
const CARBURANTS = ['Essence', 'Diesel', 'Hybride', 'Électrique'];
const TRANSMISSIONS = ['Manuelle', 'Automatique'];

const emptyForm = {
  marque: 'VOLKSWAGEN',
  modele: '',
  annee: '',
  prix: '',
  prixPromo: '',
  kilometrage: '',
  carburant: 'Essence',
  transmission: 'Manuelle',
  description: '',
};

const CataloguePage = () => {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchVehicules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/vehicules', { params: { limit: 200 } });
      setVehicules(res.data.data.vehicules || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicules(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditingId(v.id);
    setForm({
      marque: v.marque,
      modele: v.modele,
      annee: v.annee,
      prix: v.prix,
      prixPromo: v.prixPromo || '',
      kilometrage: v.kilometrage,
      carburant: v.carburant,
      transmission: v.transmission,
      description: v.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        marque: form.marque,
        modele: form.modele,
        annee: Number(form.annee),
        prix: Number(form.prix),
        prixPromo: form.prixPromo ? Number(form.prixPromo) : null,
        kilometrage: Number(form.kilometrage),
        carburant: form.carburant,
        transmission: form.transmission,
        description: form.description,
      };

      if (editingId) {
        await api.put(`/api/vehicules/${editingId}`, payload);
        toast.success('Véhicule modifié');
      } else {
        await api.post('/api/vehicules', payload);
        toast.success('Véhicule ajouté');
      }
      setShowModal(false);
      fetchVehicules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/vehicules/${id}`);
      toast.success('Véhicule supprimé');
      setDeleteConfirm(null);
      fetchVehicules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Catalogue</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-[#CC0000] hover:bg-[#a30000] text-white text-sm font-medium rounded-lg transition-colors">
          + Ajouter véhicule
        </button>
      </div>

      {vehicules.length === 0 ? (
        <p className="text-gray-400">Aucun véhicule dans le catalogue.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Marque</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Modèle</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Année</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Prix</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Statut</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vehicules.map(v => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{v.marque}</td>
                  <td className="px-4 py-3 text-sm">{v.modele}</td>
                  <td className="px-4 py-3 text-sm">{v.annee}</td>
                  <td className="px-4 py-3 text-sm">
                    {v.prixPromo ? (
                      <div>
                        <span className="text-gray-400 line-through text-xs mr-2">{Number(v.prix).toLocaleString('fr-FR')} €</span>
                        <span className="text-[#CC0000] font-semibold">{Number(v.prixPromo).toLocaleString('fr-FR')} €</span>
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-[#CC0000] text-white font-medium">PROMO</span>
                      </div>
                    ) : (
                      <span>{Number(v.prix).toLocaleString('fr-FR')} €</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      v.statut === 'DISPONIBLE' ? 'bg-green-100 text-green-700' :
                      v.statut === 'VENDU' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{v.statut}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(v)} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                        Modifier
                      </button>
                      {deleteConfirm === v.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(v.id)} className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                            Confirmer
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 bg-gray-300 text-xs rounded hover:bg-gray-400">
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(v.id)} className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200">
                          Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{editingId ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                  <select name="marque" value={form.marque} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition">
                    {MARQUES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                  <input type="text" name="modele" value={form.modele} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                    <input type="number" name="annee" value={form.annee} onChange={handleChange} required min="1900"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage</label>
                    <input type="number" name="kilometrage" value={form.kilometrage} onChange={handleChange} required min="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                    <input type="number" name="prix" value={form.prix} onChange={handleChange} required min="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix promo (€)</label>
                    <input type="number" name="prixPromo" value={form.prixPromo} onChange={handleChange} min="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carburant</label>
                    <select name="carburant" value={form.carburant} onChange={handleChange} required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition">
                      {CARBURANTS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                    <select name="transmission" value={form.transmission} onChange={handleChange} required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition">
                      {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting}
                    className="flex-1 bg-[#CC0000] hover:bg-[#a30000] text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50">
                    {submitting ? 'Enregistrement...' : editingId ? 'Modifier' : 'Ajouter'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CataloguePage;
