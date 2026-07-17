import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ProfilPage = () => {
  const { user } = useAuth()
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '' })
  const [pwdForm, setPwdForm] = useState({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmMotDePasse: '' })
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPwd, setLoadingPwd] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ nom: user.nom || '', prenom: user.prenom || '', telephone: user.telephone || '' })
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoadingProfile(true)
    try {
      const res = await api.put('/api/auth/me', form)
      toast.success('Profil mis à jour')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setLoadingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (pwdForm.nouveauMotDePasse !== pwdForm.confirmMotDePasse) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setLoadingPwd(true)
    try {
      await api.put('/api/auth/password', {
        ancienMotDePasse: pwdForm.ancienMotDePasse,
        nouveauMotDePasse: pwdForm.nouveauMotDePasse,
      })
      toast.success('Mot de passe modifié')
      setPwdForm({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmMotDePasse: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setLoadingPwd(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="section-title">Mon profil</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="content-card p-6">
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Informations personnelles</h2>
            <div>
              <label className="form-label">Nom</label>
              <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Prénom</label>
              <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Téléphone</label>
              <input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={user?.email || ''} disabled className="form-input" />
            </div>
            <button type="submit" disabled={loadingProfile} className="btn-primary w-full">
              {loadingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>

        <div className="content-card p-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Changer le mot de passe</h2>
            <div>
              <label className="form-label">Ancien mot de passe</label>
              <input type="password" value={pwdForm.ancienMotDePasse} onChange={(e) => setPwdForm({ ...pwdForm, ancienMotDePasse: e.target.value })} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Nouveau mot de passe</label>
              <input type="password" value={pwdForm.nouveauMotDePasse} onChange={(e) => setPwdForm({ ...pwdForm, nouveauMotDePasse: e.target.value })} className="form-input" required minLength={6} />
            </div>
            <div>
              <label className="form-label">Confirmer le mot de passe</label>
              <input type="password" value={pwdForm.confirmMotDePasse} onChange={(e) => setPwdForm({ ...pwdForm, confirmMotDePasse: e.target.value })} className="form-input" required minLength={6} />
            </div>
            <button type="submit" disabled={loadingPwd} className="btn-primary w-full">
              {loadingPwd ? 'Modification...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilPage
