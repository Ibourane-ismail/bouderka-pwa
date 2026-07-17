import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'
import Pagination from '../../components/Pagination'

const ROLES = ['CLIENT', 'COMMERCIAL', 'CHEF_ATELIER', 'ADMIN']
const PAGE_SIZE = 10

const roleConfig = {
  CLIENT: { bg: 'bg-blue-50', text: 'text-blue-700' },
  COMMERCIAL: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  CHEF_ATELIER: { bg: 'bg-amber-50', text: 'text-amber-700' },
  ADMIN: { bg: 'bg-purple-50', text: 'text-purple-700' },
}

const RoleBadge = ({ role }) => {
  const c = roleConfig[role] || { bg: 'bg-gray-50', text: 'text-gray-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {role.replace('_', ' ')}
    </span>
  )
}

const Toggle = ({ active, onChange }) => (
  <button onClick={onChange} className={`toggle ${active ? 'active' : ''}`}>
    <span className="toggle-knob" />
  </button>
)

const ClientsPage = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const fetchClients = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/clients')
      setClients(res.data.data.clients || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClients() }, [])

  const toggleActif = async (id) => {
    try {
      await api.put(`/api/clients/${id}/actif`)
      setClients(prev => prev.map(c => c.id === id ? { ...c, actif: !c.actif } : c))
      toast.success('Statut mis à jour')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const changeRole = async (id, role) => {
    try {
      await api.put(`/api/clients/${id}/role`, { role })
      setClients(prev => prev.map(c => c.id === id ? { ...c, role } : c))
      toast.success('Rôle mis à jour')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return !q || c.nom?.toLowerCase().includes(q) || c.prenom?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-title" />
        <div className="skeleton h-12 w-96" />
        <div className="skeleton h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Gestion des utilisateurs</h1>
        <p className="text-sm text-gray-400 mt-1">{clients.length} utilisateurs inscrits</p>
      </div>

      <div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Rechercher par nom, prénom, email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10 w-full md:w-96" />
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'nom', label: 'Nom', render: (c) => <span className="font-semibold">{c.nom}</span> },
          { key: 'prenom', label: 'Prénom' },
          { key: 'email', label: 'Email', render: (c) => <span className="text-gray-400">{c.email}</span> },
          { key: 'telephone', label: 'Téléphone', render: (c) => c.telephone || <span className="text-gray-300">—</span> },
          { key: 'role', label: 'Rôle', render: (c) => <RoleBadge role={c.role} /> },
          {
            key: 'actif', label: 'Actif',
            render: (c) => <Toggle active={c.actif} onChange={() => toggleActif(c.id)} />,
          },
          {
            key: 'actions', label: 'Actions',
            render: (c) => (
              <select value={c.role} onChange={(e) => changeRole(c.id, e.target.value)}
                className="form-select text-xs py-1.5 px-3 w-auto min-w-[130px]">
                {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            ),
          },
        ]}
        data={paginated}
        renderMobileCard={(c) => (
          <div key={c.id} className="content-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">{c.nom} {c.prenom}</span>
              <RoleBadge role={c.role} />
            </div>
            <p className="text-sm text-gray-500">{c.email}</p>
            <p className="text-sm text-gray-400">{c.telephone || '—'}</p>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{c.actif ? 'Actif' : 'Inactif'}</span>
                <Toggle active={c.actif} onChange={() => toggleActif(c.id)} />
              </div>
              <select value={c.role} onChange={(e) => changeRole(c.id, e.target.value)}
                className="form-select text-xs py-1.5 w-auto min-w-[120px]">
                {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
        )}
      />

      <Pagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} onPageChange={setPage} />
    </div>
  )
}

export default ClientsPage
