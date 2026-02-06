import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardPlus,
  History,
  BarChart3,
  Store,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Nueva Auditoría', to: '/nueva-auditoria', icon: ClipboardPlus },
  { name: 'Historial', to: '/historial', icon: History },
  { name: 'Reportes', to: '/reportes', icon: BarChart3 },
  { name: 'Locales', to: '/locales', icon: Store },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-primary-700">San Camilo</h1>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name ?? 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role ?? ''}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center h-16 px-6 bg-white shadow-sm">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            Sistema de Auditorías
          </h2>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
