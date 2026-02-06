import { useEffect, useState } from 'react'
import { Store as StoreIcon, Plus, MapPin, Search, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Store, Zone, Database } from '../lib/database.types'

interface StoreWithZone extends Store {
  zone?: Zone | null
}

export default function Stores() {
  const { profile } = useAuth()
  const [stores, setStores] = useState<StoreWithZone[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [formData, setFormData] = useState({ name: '', address: '', zone_id: '' })

  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [storesResult, zonesResult] = await Promise.all([
        supabase.from('stores').select('*, zone:zones(*)').order('name'),
        supabase.from('zones').select('*').order('name'),
      ])
      setStores((storesResult.data as unknown as StoreWithZone[]) ?? [])
      setZones((zonesResult.data as unknown as Zone[]) ?? [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateForm() {
    setEditingStore(null)
    setFormData({ name: '', address: '', zone_id: '' })
    setShowForm(true)
  }

  function openEditForm(store: Store) {
    setEditingStore(store)
    setFormData({ name: store.name, address: store.address, zone_id: store.zone_id })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingStore) {
        const { error } = await supabase
          .from('stores')
          .update(formData as Database['public']['Tables']['stores']['Update'])
          .eq('id', editingStore.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('stores').insert(formData as Database['public']['Tables']['stores']['Insert'])
        if (error) throw error
      }
      setShowForm(false)
      fetchData()
    } catch (error) {
      console.error('Error saving store:', error)
      alert('Error al guardar el local.')
    }
  }

  async function handleDelete(storeId: string) {
    if (!confirm('¿Estás seguro de eliminar este local?')) return
    try {
      const { error } = await supabase.from('stores').delete().eq('id', storeId)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting store:', error)
      alert('Error al eliminar el local.')
    }
  }

  const filtered = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(search.toLowerCase()) ||
      store.address.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="h-11 w-full bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
              <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-50 rounded-xl">
            <StoreIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Locales</h1>
            <p className="text-[13px] text-slate-500">
              {stores.length} {stores.length === 1 ? 'local registrado' : 'locales registrados'}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateForm}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Local
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o dirección..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Store grid or empty state */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16">
          <div className="p-3 bg-slate-100 rounded-xl mb-4">
            <StoreIcon className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-[15px] font-medium text-slate-900">No se encontraron locales</p>
          <p className="text-[13px] text-slate-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((store) => (
            <div
              key={store.id}
              className="card-hover p-5"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight">
                    {store.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
                    <MapPin size={14} className="shrink-0" />
                    <span>{store.address}</span>
                  </div>
                  {store.zone && (
                    <span className="badge bg-brand-50 text-brand-700 inline-block">
                      {store.zone.name}
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditForm(store)}
                      className="p-2 rounded-lg transition-all duration-150 text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(store.id)}
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
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">
              {editingStore ? 'Editar Local' : 'Nuevo Local'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                  Dirección
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                  Zona
                </label>
                <select
                  required
                  value={formData.zone_id}
                  onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">-- Seleccionar zona --</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
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
                  {editingStore ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
