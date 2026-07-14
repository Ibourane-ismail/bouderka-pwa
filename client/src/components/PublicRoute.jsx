import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (user) {
    const dashboards = {
      CLIENT: '/client/dashboard',
      COMMERCIAL: '/commercial/dashboard',
      CHEF_ATELIER: '/atelier/dashboard',
      ADMIN: '/admin/dashboard',
    }
    return <Navigate to={dashboards[user.role] || '/login'} replace />
  }

  return children
}

export default PublicRoute
