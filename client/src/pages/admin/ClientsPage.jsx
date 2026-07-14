import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ROLES = ['CLIENT', 'COMMERCIAL', 'CHEF_ATELIER', 'ADMIN'];
const PAGE_SIZE = 10;

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/clients');
      setClients(res.data.data.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const toggleActif = async (id) => {
    try {
      await api.put(`/api/clients/${id}/actif`);
      setClients(prev => prev.map(c => c.id === id ? { ...c, actif: !c.actif } : c));
      toast.success('Statut mis à jour');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.put(`/api/clients/${id}/role`, { role });
      setClients(prev => prev.map(c => c.id === id ? { ...c, role } : c));
      toast.success('Rôle mis à jour');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.nom?.toLowerCase().includes(q) || c.prenom?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);

  const roleBadge = (role) => {
    const cls = {
      CLIENT: 'bg-blue-100 text-blue-700',
      COMMERCIAL: 'bg-green-100 text-green-700',
      CHEF_ATELIER: 'bg-yellow-100 text-yellow-700',
      ADMIN: 'bg-purple-100 text-purple-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${cls[role] || 'bg-gray-100 text-gray-700'}`}>
        {role.replace('_', ' ')}
      </span>
    );
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestion des Utilisateurs</h1>

      <div className="mb-4">
        <input type="text" placeholder="Rechercher par nom, prénom, email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
      </div>

      {paginated.length === 0 ? (
        <p className="text-gray-400">Aucun utilisateur trouvé.</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Nom</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Prénom</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Téléphone</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Rôle</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Actif</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginated.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{c.nom}</td>
                    <td className="px-4 py-3 text-sm">{c.prenom}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.telephone || '—'}</td>
                    <td className="px-4 py-3 text-sm">{roleBadge(c.role)}</td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => toggleActif(c.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          c.actif ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                          c.actif ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`} style={{ transform: `translateX(${c.actif ? '18px' : '2px'})` }} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <select value={c.role} onChange={(e) => changeRole(c.id, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition">
                        {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                {filtered.length} résultat(s) — Page {page}/{totalPages}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">
                  Précédent
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClientsPage;
