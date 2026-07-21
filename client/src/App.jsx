import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

import ClientLayout from './layouts/ClientLayout'
import CommercialLayout from './layouts/CommercialLayout'
import AtelierLayout from './layouts/AtelierLayout'
import AdminLayout from './layouts/AdminLayout'

import { PageLoader } from './components/Skeleton'

const HomePage = React.lazy(() => import('./pages/HomePage'))
const BrandCataloguePage = React.lazy(() => import('./pages/BrandCataloguePage'))
const VehicleDetailPage = React.lazy(() => import('./pages/VehicleDetailPage'))

const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'))

const ClientDashboardPage = React.lazy(() => import('./pages/client/DashboardPage'))
const RdvPage = React.lazy(() => import('./pages/client/RdvPage'))
const HistoriquePage = React.lazy(() => import('./pages/client/HistoriquePage'))
const ClientCataloguePage = React.lazy(() => import('./pages/client/CataloguePage'))
const NotificationsPage = React.lazy(() => import('./pages/client/NotificationsPage'))
const ProfilPage = React.lazy(() => import('./pages/client/ProfilPage'))

const CommercialDashboard = React.lazy(() => import('./pages/commercial/DashboardPage'))
const CommercialCatalogue = React.lazy(() => import('./pages/commercial/CataloguePage'))
const TestDrivesPage = React.lazy(() => import('./pages/commercial/TestDrivesPage'))
const CommercialMedia = React.lazy(() => import('./pages/commercial/MediaPage'))

const AtelierDashboard = React.lazy(() => import('./pages/atelier/DashboardPage'))
const CalendrierPage = React.lazy(() => import('./pages/atelier/CalendrierPage'))
const VehiculesPage = React.lazy(() => import('./pages/atelier/VehiculesPage'))

const AdminDashboard = React.lazy(() => import('./pages/admin/DashboardPage'))
const ClientsPage = React.lazy(() => import('./pages/admin/ClientsPage'))

const Forbidden = React.lazy(() => import('./pages/Forbidden'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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

        {/* ===== Détail véhicule ===== */}
        <Route path="/vehicule/:id" element={<VehicleDetailPage />} />

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
          <Route path="dashboard" element={<ClientDashboardPage />} />
          <Route path="rdv" element={<RdvPage />} />
          <Route path="historique" element={<HistoriquePage />} />
          <Route path="catalogue" element={<ClientCataloguePage />} />
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
          <Route path="media" element={<CommercialMedia />} />
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
    </Suspense>
  )
}

export default App
