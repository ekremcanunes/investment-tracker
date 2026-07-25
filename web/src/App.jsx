import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Assets from './pages/Assets'
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
              <Route path="/assets" element={<Assets />} />
              <Route path="/assets/buy" element={<AddAsset />} />
              <Route path="/analytics" element={<Analytics />} />
              {/* Eski route'lar yönlendirmesi */}
              <Route path="/portfolios" element={<Navigate to="/assets" replace />} />
              <Route path="/portfolios/:id" element={<Navigate to="/assets" replace />} />
              <Route path="/transactions" element={<Navigate to="/assets" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
