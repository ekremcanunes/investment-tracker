import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Income from './pages/Income'
import Expenses from './pages/Expenses'
import Transactions from './pages/Transactions'
import Assets from './pages/Assets'
import AssetDetail from './pages/AssetDetail'
import AddAsset from './pages/AddAsset'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Overview />} />
              <Route path="/income" element={<Income />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/assets/:id" element={<AssetDetail />} />
              <Route path="/assets/:id/add" element={<AddAsset />} />
              <Route path="/analytics" element={<Analytics />} />
              {/* Eski route'lar yönlendirmesi */}
              <Route path="/portfolios" element={<Navigate to="/assets" replace />} />
              <Route path="/portfolios/:id" element={<Navigate to="/assets" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
