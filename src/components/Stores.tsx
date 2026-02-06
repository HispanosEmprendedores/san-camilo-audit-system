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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <StoreIcon className="h-7 w-7 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Locales</h1>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Nuevo Local
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o dirección..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <p className="text-gray-500">No se encontraron locales</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{store.name}</h3>
                  <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                    <MapPin size={14} />
                    {store.address}
                  </p>
                  {store.zone && (
                    <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 text-primary-700">
                      {store.zone.name}
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditForm(store)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(store.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingStore ? 'Editar Local' : 'Nuevo Local'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
                <select
                  required
                  value={formData.zone_id}
                  onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="">-- Seleccionar zona --</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors"
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
