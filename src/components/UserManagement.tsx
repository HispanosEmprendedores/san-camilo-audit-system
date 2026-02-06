import { useEffect, useState } from 'react'
import { Users, Plus, Search, Pencil, Trash2, Shield, X, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { UserProfile, Store, UserRole, Database } from '../lib/database.types'

interface UserWithStore extends UserProfile {
  store?: Store | null
}

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-red-50 text-red-600',
  supervisor: 'bg-brand-50 text-brand-600',
  encargada: 'bg-emerald-50 text-emerald-600',
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  encargada: 'Encargada',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const AVATAR_GRADIENTS: string[] = [
  'from-brand-500 to-brand-700',
  'from-emerald-500 to-emerald-700',
  'from-violet-500 to-violet-700',
  'from-amber-500 to-amber-700',
  'from-rose-500 to-rose-700',
  'from-cyan-500 to-cyan-700',
]

function getAvatarGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

export default function UserManagement() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<UserWithStore[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithStore | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'encargada' as UserRole,
    store_id: '',
    password: '',
  })

  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [usersResult, storesResult] = await Promise.all([
        supabase.from('user_profiles').select('*, store:stores(*)').order('full_name'),
        supabase.from('stores').select('*').order('name'),
      ])
      setUsers((usersResult.data as unknown as UserWithStore[]) ?? [])
      setStores((storesResult.data as unknown as Store[]) ?? [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateForm() {
    setEditingUser(null)
    setFormData({ full_name: '', email: '', role: 'encargada', store_id: '', password: '' })
    setShowForm(true)
  }

  function openEditForm(user: UserWithStore) {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      store_id: user.store_id ?? '',
      password: '',
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingUser) {
        const updatePayload = {
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
          store_id: formData.store_id || null,
        } as Database['public']['Tables']['user_profiles']['Update']

        const { error } = await supabase
          .from('user_profiles')
          .update(updatePayload)
          .eq('id', editingUser.id)
        if (error) throw error
      } else {
        const insertPayload = {
          id: crypto.randomUUID(),
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
          store_id: formData.store_id || null,
        } as Database['public']['Tables']['user_profiles']['Insert']

        const { error } = await supabase.from('user_profiles').insert(insertPayload)
        if (error) throw error
      }
      setShowForm(false)
      fetchData()
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Error al guardar el usuario.')
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return
    try {
      const { error } = await supabase.from('user_profiles').delete().eq('id', userId)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error al eliminar el usuario.')
    }
  }

  const filtered = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-11 flex-1 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-11 w-44 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-50 rounded-xl">
            <Users className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Usuarios</h1>
            <p className="text-[13px] text-slate-500">
              {users.length} {users.length === 1 ? 'usuario registrado' : 'usuarios registrados'}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateForm}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Search and filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field w-44"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="supervisor">Supervisor</option>
          <option value="encargada">Encargada</option>
        </select>
      </div>

      {/* User grid or empty state */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16">
          <div className="p-3 bg-slate-100 rounded-xl mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-[15px] font-medium text-slate-900">No se encontraron usuarios</p>
          <p className="text-[13px] text-slate-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="card-hover p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarGradient(user.id)} flex items-center justify-center shrink-0`}
                  >
                    <span className="text-[13px] font-semibold text-white leading-none">
                      {getInitials(user.full_name)}
                    </span>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight truncate">
                      {user.full_name}
                    </h3>
                    <p className="text-[13px] text-slate-500 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      <span className={`badge ${ROLE_STYLES[user.role]}`}>
                        <Shield size={12} className="mr-1 inline-block" />
                        {ROLE_LABELS[user.role]}
                      </span>
                      {user.store && (
                        <span className="badge bg-slate-100 text-slate-600">
                          {user.store.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEditForm(user)}
                      className="p-2 rounded-lg transition-all duration-150 text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 rounded-lg transition-all duration-150 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-elevated max-w-md w-full p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg transition-all duration-150 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input-field"
                  placeholder="Nombre y apellido"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <p className="text-[12px] text-amber-600 mt-1.5 leading-relaxed">
                    Nota: Este campo es de referencia. El usuario de autenticación debe crearse
                    directamente en el panel de Supabase. Aquí solo se registra el perfil del usuario.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                  Rol
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="input-field"
                >
                  <option value="encargada">Encargada</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                  Local asignado
                  <span className="text-slate-400 font-normal ml-1">(opcional)</span>
                </label>
                <select
                  value={formData.store_id}
                  onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">-- Sin asignar --</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingUser ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
