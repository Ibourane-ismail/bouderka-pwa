import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '' });
  const [pwdForm, setPwdForm] = useState({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmMotDePasse: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ nom: user.nom || '', prenom: user.prenom || '', telephone: user.telephone || '' });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await api.put('/api/auth/me', form);
      toast.success('Profil mis à jour');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.nouveauMotDePasse !== pwdForm.confirmMotDePasse) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setLoadingPwd(true);
    try {
      await api.put('/api/auth/password', {
        ancienMotDePasse: pwdForm.ancienMotDePasse,
        nouveauMotDePasse: pwdForm.nouveauMotDePasse,
      });
      toast.success('Mot de passe modifié');
      setPwdForm({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmMotDePasse: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoadingPwd(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={user?.email || ''} disabled
                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500" />
            </div>
          </div>
          <button type="submit" disabled={loadingProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {loadingProfile ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Changer le mot de passe</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ancien mot de passe</label>
              <input type="password" value={pwdForm.ancienMotDePasse}
                onChange={(e) => setPwdForm({ ...pwdForm, ancienMotDePasse: e.target.value })}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input type="password" value={pwdForm.nouveauMotDePasse}
                onChange={(e) => setPwdForm({ ...pwdForm, nouveauMotDePasse: e.target.value })}
                className="w-full border rounded px-3 py-2" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input type="password" value={pwdForm.confirmMotDePasse}
                onChange={(e) => setPwdForm({ ...pwdForm, confirmMotDePasse: e.target.value })}
                className="w-full border rounded px-3 py-2" required minLength={6} />
            </div>
          </div>
          <button type="submit" disabled={loadingPwd}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50">
            {loadingPwd ? 'Modification...' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilPage;
