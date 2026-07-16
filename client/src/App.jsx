import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BrandCataloguePage from './pages/BrandCataloguePage'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

import ClientLayout from './layouts/ClientLayout'
import CommercialLayout from './layouts/CommercialLayout'
import AtelierLayout from './layouts/AtelierLayout'
import AdminLayout from './layouts/AdminLayout'

import DashboardPage from './pages/client/DashboardPage'
import RdvPage from './pages/client/RdvPage'
import HistoriquePage from './pages/client/HistoriquePage'
import CataloguePage from './pages/client/CataloguePage'
import NotificationsPage from './pages/client/NotificationsPage'
import ProfilPage from './pages/client/ProfilPage'

import CommercialDashboard from './pages/commercial/DashboardPage'
import CommercialCatalogue from './pages/commercial/CataloguePage'
import TestDrivesPage from './pages/commercial/TestDrivesPage'

import AtelierDashboard from './pages/atelier/DashboardPage'
import CalendrierPage from './pages/atelier/CalendrierPage'
import VehiculesPage from './pages/atelier/VehiculesPage'

import AdminDashboard from './pages/admin/DashboardPage'
import ClientsPage from './pages/admin/ClientsPage'

import Forbidden from './pages/Forbidden'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>

      {/* ===== Page d'accueil publique ===== */}
      <Route
  path="/"
  element={
    <PublicRoute>
      <HomePage />
    </PublicRoute>
  }
/>

      {/* ===== Catalogue par marque ===== */}
      <Route path="/catalogue/:marque" element={<BrandCataloguePage />} />

      {/* ===== Authentification ===== */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* ===== Client ===== */}
      <Route
        path="/client"
        element={
          <ProtectedRoute roles={['CLIENT']}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="rdv" element={<RdvPage />} />
        <Route path="historique" element={<HistoriquePage />} />
        <Route path="catalogue" element={<CataloguePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profil" element={<ProfilPage />} />
      </Route>

      {/* ===== Commercial ===== */}
      <Route
        path="/commercial"
        element={
          <ProtectedRoute roles={['COMMERCIAL']}>
            <CommercialLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CommercialDashboard />} />
        <Route path="catalogue" element={<CommercialCatalogue />} />
        <Route path="test-drives" element={<TestDrivesPage />} />
      </Route>

      {/* ===== Chef Atelier ===== */}
      <Route
        path="/atelier"
        element={
          <ProtectedRoute roles={['CHEF_ATELIER']}>
            <AtelierLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AtelierDashboard />} />
        <Route path="calendrier" element={<CalendrierPage />} />
        <Route path="vehicules" element={<VehiculesPage />} />
      </Route>

      {/* ===== Administrateur ===== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="clients" element={<ClientsPage />} />
      </Route>

      {/* ===== Erreurs ===== */}
      <Route path="/403" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />

    </Routes>
  )
}

export default App