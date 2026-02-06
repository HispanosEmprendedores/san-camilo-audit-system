import { useEffect, useState } from 'react'
import { ClipboardPlus, Check, X, Camera, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Store, ChecklistCategory, ChecklistItem, Audit, Database } from '../lib/database.types'

interface CategoryWithItems extends ChecklistCategory {
  items?: ChecklistItem[]
}

interface ResponseState {
  [itemId: string]: {
    compliant: boolean | null
    observation: string
  }
}

export default function NewAudit() {
  const { user, profile } = useAuth()
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState('')
  const [categories, setCategories] = useState<CategoryWithItems[]>([])
  const [responses, setResponses] = useState<ResponseState>({})
  const [photos, setPhotos] = useState<File[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [storesResult, categoriesResult] = await Promise.all([
        profile?.role === 'encargada' && profile.store_id
          ? supabase.from('stores').select('*').eq('id', profile.store_id)
          : supabase.from('stores').select('*').order('name'),
        supabase
          .from('checklist_categories')
          .select('*, items:checklist_items(*)')
          .order('order_index'),
      ])

      const storesData = (storesResult.data ?? []) as unknown as Store[]
      setStores(storesData)
      setCategories((categoriesResult.data as unknown as CategoryWithItems[]) ?? [])

      if (storesData.length === 1) {
        setSelectedStore(storesData[0].id)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleResponse(itemId: string, compliant: boolean) {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], compliant, observation: prev[itemId]?.observation ?? '' },
    }))
  }

  function handleObservation(itemId: string, observation: string) {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], compliant: prev[itemId]?.compliant ?? null, observation },
    }))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setPhotos((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStore || !user) return
    setSubmitting(true)

    try {
      const allItems = categories.flatMap((c) => c.items ?? [])
      const answered = allItems.filter((item) => responses[item.id]?.compliant !== null && responses[item.id]?.compliant !== undefined)
      const compliant = answered.filter((item) => responses[item.id]?.compliant === true)
      const score = allItems.length > 0 ? Math.round((compliant.length / allItems.length) * 100) : 0

      const { data: auditRaw, error: auditError } = await supabase
        .from('audits')
        .insert({
          store_id: selectedStore,
          auditor_id: user.id,
          status: 'completed',
          score,
          notes: notes || null,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (auditError) throw auditError
      const audit = auditRaw as unknown as Audit

      const responsesToInsert = Object.entries(responses)
        .filter(([, r]) => r.compliant !== null)
        .map(([itemId, r]) => ({
          audit_id: audit.id,
          checklist_item_id: itemId,
          compliant: r.compliant!,
          observation: r.observation || null,
        }))

      if (responsesToInsert.length > 0) {
        const { error: respError } = await supabase
          .from('audit_responses')
          .insert(responsesToInsert as Database['public']['Tables']['audit_responses']['Insert'][])
        if (respError) throw respError
      }

      for (const photo of photos) {
        const fileName = `${audit.id}/${Date.now()}-${photo.name}`
        const { error: uploadError } = await supabase.storage
          .from('audit-photos')
          .upload(fileName, photo)

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('audit-photos')
            .getPublicUrl(fileName)

          await supabase.from('audit_photos').insert({
            audit_id: audit.id,
            photo_url: urlData.publicUrl,
            caption: null,
          } as Database['public']['Tables']['audit_photos']['Insert'])
        }
      }

      setSuccess(true)
      setResponses({})
      setPhotos([])
      setNotes('')
    } catch (error) {
      console.error('Error submitting audit:', error)
      alert('Error al enviar la auditoría. Intente nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="bg-green-50 rounded-2xl p-8">
          <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Auditoría Enviada</h2>
          <p className="text-gray-600 mb-6">La auditoría se registró correctamente.</p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            Nueva Auditoría
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardPlus className="h-7 w-7 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Nueva Auditoría</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Local
          </label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">-- Selecciona un local --</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} - {store.address}
              </option>
            ))}
          </select>
        </div>

        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.name}</h3>
            <div className="space-y-4">
              {(category.items ?? [])
                .sort((a: ChecklistItem, b: ChecklistItem) => a.order_index - b.order_index)
                .map((item: ChecklistItem) => (
                  <div key={item.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-gray-700 flex-1">{item.description}</p>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleResponse(item.id, true)}
                          className={`p-2 rounded-lg transition-colors ${
                            responses[item.id]?.compliant === true
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-400 hover:bg-green-50'
                          }`}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResponse(item.id, false)}
                          className={`p-2 rounded-lg transition-colors ${
                            responses[item.id]?.compliant === false
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-400 hover:bg-red-50'
                          }`}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                    {responses[item.id]?.compliant === false && (
                      <textarea
                        placeholder="Observación (opcional)"
                        value={responses[item.id]?.observation ?? ''}
                        onChange={(e) => handleObservation(item.id, e.target.value)}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        rows={2}
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidencia Fotográfica</h3>
          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors justify-center">
            <Camera className="h-6 w-6 text-gray-400" />
            <span className="text-sm text-gray-500">Agregar fotos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Adicionales
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            rows={3}
            placeholder="Observaciones generales de la auditoría..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !selectedStore}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <Send size={20} />
              Enviar Auditoría
            </>
          )}
        </button>
      </form>
    </div>
  )
}
