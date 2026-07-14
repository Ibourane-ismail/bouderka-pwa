import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await register(form.nom, form.prenom, form.email, form.telephone, form.password);
      toast.success('Inscription réussie');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Créer un compte</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6">Inscription</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                <input type="text" name="nom" value={form.nom} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                <input type="text" name="prenom" value={form.prenom} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="votre@email.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
              <input type="tel" name="telephone" value={form.telephone} onChange={handleChange} required
                placeholder="06 00 00 00 00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer mot de passe</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition" />
            </div>
          </div>

          <button type="submit" className="w-full mt-6 bg-[#CC0000] hover:bg-[#a30000] text-white font-medium py-2.5 rounded-lg transition-colors text-sm">
            S'inscrire
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <a href="/login" className="text-[#CC0000] hover:underline font-medium">Connexion</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
