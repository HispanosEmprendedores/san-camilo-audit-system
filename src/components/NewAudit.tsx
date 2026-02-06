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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="skeleton h-7 w-7 rounded-lg" />
          <div className="skeleton h-8 w-56" />
        </div>
        <div className="card p-6 space-y-4">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-11 w-full rounded-lg" />
        </div>
        <div className="card p-6 space-y-4">
          <div className="skeleton h-5 w-48" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
        <div className="card p-6 space-y-4">
          <div className="skeleton h-5 w-48" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-12 animate-slide-up">
        <div className="card bg-gradient-to-br from-brand-500 to-brand-700 p-10 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-5">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            Auditoría Enviada
          </h2>
          <p className="text-[15px] text-white/80 mb-8">
            La auditoría se registró correctamente.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-white/90 transition-all duration-200"
          >
            Nueva Auditoría
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8 animate-slide-up">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-50">
          <ClipboardPlus className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Nueva Auditoría
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Complete el checklist para registrar la auditoría
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Store Selection */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <label className="block text-[13px] font-semibold text-slate-700 mb-2">
            Seleccionar Local
          </label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            required
            className="input-field"
          >
            <option value="">-- Selecciona un local --</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} - {store.address}
              </option>
            ))}
          </select>
        </div>

        {/* Checklist Categories */}
        {categories.map((category, catIdx) => (
          <div
            key={category.id}
            className="card p-6 animate-slide-up"
            style={{ animationDelay: `${(catIdx + 1) * 75 + 50}ms` }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight">
                {category.name}
              </h3>
              <span className="badge bg-slate-100 text-slate-500">
                {(category.items ?? []).length} items
              </span>
            </div>
            <div className="space-y-0">
              {(category.items ?? [])
                .sort((a: ChecklistItem, b: ChecklistItem) => a.order_index - b.order_index)
                .map((item: ChecklistItem, itemIdx: number) => {
                  const isCompliant = responses[item.id]?.compliant
                  return (
                    <div
                      key={item.id}
                      className={`py-3.5 ${
                        itemIdx < (category.items ?? []).length - 1
                          ? 'border-b border-slate-100'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-[15px] text-slate-700 flex-1 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleResponse(item.id, true)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isCompliant === true
                                ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResponse(item.id, false)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isCompliant === false
                                ? 'bg-red-100 text-red-700 ring-2 ring-red-200'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                      {isCompliant === false && (
                        <div className="mt-2.5 animate-slide-up">
                          <textarea
                            placeholder="Observación (opcional)"
                            value={responses[item.id]?.observation ?? ''}
                            onChange={(e) => handleObservation(item.id, e.target.value)}
                            className="input-field text-[13px]"
                            rows={2}
                          />
                        </div>
                      )}
                      {isCompliant === true && (
                        <div className="mt-1.5">
                          <span className="badge bg-emerald-50 text-emerald-600">Cumple</span>
                        </div>
                      )}
                      {isCompliant === false && (
                        <div className="mt-1.5">
                          <span className="badge bg-amber-50 text-amber-600">No cumple</span>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))}

        {/* Photo Evidence */}
        <div
          className="card p-6 animate-slide-up"
          style={{ animationDelay: `${(categories.length + 1) * 75 + 50}ms` }}
        >
          <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight mb-4">
            Evidencia Fotográfica
          </h3>
          <label className="flex flex-col items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl p-8 transition-all duration-200 justify-center group">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-200/80 group-hover:scale-105 transition-transform duration-200">
              <Camera className="h-5 w-5 text-slate-400" />
            </div>
            <span className="text-[13px] text-slate-500 font-medium mt-1">
              Agregar fotos
            </span>
            <span className="text-[13px] text-slate-400">
              Haga clic o arrastre archivos aquí
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
          {photos.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-28 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 rounded-xl" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-2 right-2 flex items-center justify-center h-7 w-7 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div
          className="card p-6 animate-slide-up"
          style={{ animationDelay: `${(categories.length + 2) * 75 + 50}ms` }}
        >
          <label className="block text-[13px] font-semibold text-slate-700 mb-2">
            Notas Adicionales
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Observaciones generales de la auditoría..."
          />
        </div>

        {/* Submit Button */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: `${(categories.length + 3) * 75 + 50}ms` }}
        >
          <button
            type="submit"
            disabled={submitting || !selectedStore}
            className="btn-primary w-full flex items-center justify-center gap-2.5 py-3.5 text-[15px] rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center gap-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                <span>Enviando...</span>
              </div>
            ) : (
              <>
                <Send size={18} />
                Enviar Auditoría
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
