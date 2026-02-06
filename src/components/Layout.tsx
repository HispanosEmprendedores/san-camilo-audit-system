import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardPlus,
  History,
  BarChart3,
  Store,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Nueva Auditoria', to: '/nueva-auditoria', icon: ClipboardPlus },
  { name: 'Historial', to: '/historial', icon: History },
  { name: 'Reportes', to: '/reportes', icon: BarChart3 },
  { name: 'Locales', to: '/locales', icon: Store },
]

const pageNames: Record<string, string> = {
  '/': 'Dashboard',
  '/nueva-auditoria': 'Nueva Auditoria',
  '/historial': 'Historial de Auditorias',
  '/reportes': 'Reportes y Analisis',
  '/locales': 'Gestion de Locales',
}

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentPage = pageNames[location.pathname] ?? 'San Camilo'

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'SC'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[272px] bg-slate-900 shadow-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-[72px] px-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-white tracking-tight">San Camilo</h1>
              <p className="text-[11px] text-slate-400 font-medium">Sistema de Auditorias</p>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-2 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            Menu principal
          </p>
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/[0.1] text-white shadow-sm'
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={19} className={isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-400'} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center ring-2 ring-white/10">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">
                {profile?.full_name ?? 'Usuario'}
              </p>
              <p className="text-[11px] text-slate-400 capitalize">{profile?.role ?? ''}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-[13px] font-medium text-slate-400 hover:text-red-400 hover:bg-white/[0.06] rounded-lg transition-all duration-150"
          >
            <LogOut size={16} />
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-[272px] min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 h-[72px] bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={22} />
              </button>
              <div>
                <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-0.5">
                  <span>San Camilo</span>
                  <ChevronRight size={12} />
                  <span className="text-slate-600">{currentPage}</span>
                </div>
                <h2 className="text-[17px] font-semibold text-slate-900 tracking-tight">
                  {currentPage}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
              </button>
              <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-white">{initials}</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-[13px] font-medium text-slate-700 leading-tight">
                    {profile?.full_name ?? 'Usuario'}
                  </p>
                  <p className="text-[11px] text-slate-400 capitalize">{profile?.role ?? ''}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
