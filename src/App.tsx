import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import NewAudit from './components/NewAudit'
import AuditHistory from './components/AuditHistory'
import Reports from './components/Reports'
import Stores from './components/Stores'
import UserManagement from './components/UserManagement'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-slate-500 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">SC</span>
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">San Camilo</h1>
              <p className="text-xs text-slate-500">Sistema de Auditorias</p>
            </div>
          </div>
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-slate-500 font-medium">Iniciando sesion...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginForm />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="nueva-auditoria" element={<NewAudit />} />
        <Route path="historial" element={<AuditHistory />} />
        <Route path="reportes" element={<Reports />} />
        <Route path="locales" element={<Stores />} />
        <Route path="usuarios" element={<UserManagement />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
