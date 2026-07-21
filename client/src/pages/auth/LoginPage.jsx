import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const roleRedirect = {
    CLIENT: '/client/dashboard',
    COMMERCIAL: '/commercial/dashboard',
    CHEF_ATELIER: '/atelier/dashboard',
    ADMIN: '/admin/dashboard',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      toast.success('Connexion réussie');
      const target = from && from !== '/' ? from : roleRedirect[data.data.user.role] || '/login';
      navigate(target, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-[#1a1a1a] p-6 md:p-8 rounded-2xl shadow-lg w-fit mx-auto mb-6">
            <Logo className="h-[80px] md:h-[120px] mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Espace Client</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#CC0000] transition-all duration-200 mb-6 group">
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="text-sm">Retour à l'accueil</span>
          </Link>
          <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6">Connexion</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition"
              />
            </div>
          </div>

          <button type="submit" className="w-full mt-6 bg-[#CC0000] hover:bg-[#a30000] text-white font-medium py-2.5 rounded-lg transition-colors text-sm">
            Se connecter
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Pas de compte ?{' '}
            <Link to="/register" state={from ? { from } : undefined} className="text-[#CC0000] hover:underline font-medium">Inscription</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
