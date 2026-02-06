import { useEffect, useState } from 'react'
import { History, Eye, Search, X, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Audit, Store, UserProfile } from '../lib/database.types'

interface AuditWithRelations extends Audit {
  store?: Store | null
  auditor?: UserProfile | null
}

export default function AuditHistory() {
  const { profile } = useAuth()
  const [audits, setAudits] = useState<AuditWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedAudit, setSelectedAudit] = useState<AuditWithRelations | null>(null)

  useEffect(() => {
    fetchAudits()
  }, [])

  async function fetchAudits() {
    try {
      let query = supabase
        .from('audits')
        .select('*, store:stores(*), auditor:user_profiles(*)')
        .order('created_at', { ascending: false })

      if (profile?.role === 'encargada' && profile.store_id) {
        query = query.eq('store_id', profile.store_id)
      }

      const { data, error } = await query
      if (error) throw error
      setAudits((data as unknown as AuditWithRelations[]) ?? [])
    } catch (error) {
      console.error('Error fetching audits:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = audits.filter((audit) => {
    const storeName = audit.store?.name ?? ''
    return storeName.toLowerCase().includes(search.toLowerCase())
  })

  function getScoreColor(score: number | null) {
    if (score === null) return 'text-slate-400'
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  function getScoreBg(score: number | null) {
    if (score === null) return 'bg-slate-50'
    if (score >= 80) return 'bg-emerald-50'
    if (score >= 60) return 'bg-amber-50'
    return 'bg-red-50'
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="skeleton h-8 w-8 rounded-lg" />
          <div className="skeleton h-8 w-64 rounded-lg" />
        </div>
        <div className="skeleton h-11 w-full rounded-lg" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card p-5 flex items-center gap-4">
            <div className="flex-1 space-y-3">
              <div className="skeleton h-5 w-48 rounded-lg" />
              <div className="skeleton h-4 w-36 rounded-lg" />
              <div className="skeleton h-5 w-24 rounded-lg" />
            </div>
            <div className="skeleton h-14 w-20 rounded-lg" />
            <div className="skeleton h-9 w-9 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-50">
          <History className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Historial de Auditorias
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Consulta y revisa todas las auditorias realizadas
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por local..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="card py-16 flex flex-col items-center justify-center text-center">
          <FileText size={48} className="text-slate-300 mb-4" />
          <p className="text-[15px] font-medium text-slate-900 mb-1">
            No se encontraron auditorias
          </p>
          <p className="text-[13px] text-slate-500">
            Intenta ajustar tu busqueda o verifica los filtros
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((audit) => (
            <div
              key={audit.id}
              className="card-hover p-5 flex items-center gap-4"
            >
              {/* Audit info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight truncate">
                  {audit.store?.name ?? 'Local'}
                </h3>
                <p className="text-[13px] text-slate-500 mt-1">
                  {formatDate(audit.created_at)}
                </p>
                <span
                  className={`badge mt-2 ${
                    audit.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {audit.status === 'completed' ? 'Completada' : 'En progreso'}
                </span>
              </div>

              {/* Score badge */}
              <div
                className={`flex-shrink-0 text-center px-4 py-2 rounded-xl ${getScoreBg(
                  audit.score
                )}`}
              >
                <p
                  className={`text-2xl font-bold tracking-tight ${getScoreColor(
                    audit.score
                  )}`}
                >
                  {audit.score !== null ? `${audit.score}%` : '-'}
                </p>
                <p className="text-[13px] text-slate-500">Puntaje</p>
              </div>

              {/* View button */}
              <button
                onClick={() => setSelectedAudit(audit)}
                className="flex-shrink-0 p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
              >
                <Eye size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedAudit && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAudit(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-elevated max-w-lg w-full max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Detalle de Auditoria
              </h2>
              <button
                onClick={() => setSelectedAudit(null)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6">
              {/* Score highlight */}
              <div
                className={`rounded-xl p-4 text-center mb-6 ${getScoreBg(
                  selectedAudit.score
                )}`}
              >
                <p
                  className={`text-4xl font-bold tracking-tight ${getScoreColor(
                    selectedAudit.score
                  )}`}
                >
                  {selectedAudit.score !== null
                    ? `${selectedAudit.score}%`
                    : 'Sin puntaje'}
                </p>
                <p className="text-[13px] text-slate-500 mt-1">
                  Puntaje general
                </p>
              </div>

              {/* Detail fields */}
              <dl className="space-y-4">
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <dt className="text-[13px] font-medium text-slate-500">
                    Local
                  </dt>
                  <dd className="text-[15px] text-slate-900 font-medium text-right">
                    {selectedAudit.store?.name ?? '-'}
                  </dd>
                </div>
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <dt className="text-[13px] font-medium text-slate-500">
                    Fecha
                  </dt>
                  <dd className="text-[15px] text-slate-900 text-right">
                    {formatDate(selectedAudit.created_at)}
                  </dd>
                </div>
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <dt className="text-[13px] font-medium text-slate-500">
                    Estado
                  </dt>
                  <dd>
                    <span
                      className={`badge ${
                        selectedAudit.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {selectedAudit.status === 'completed'
                        ? 'Completada'
                        : 'En progreso'}
                    </span>
                  </dd>
                </div>
                {selectedAudit.notes && (
                  <div className="py-3">
                    <dt className="text-[13px] font-medium text-slate-500 mb-1.5">
                      Notas
                    </dt>
                    <dd className="text-[15px] text-slate-900 leading-relaxed">
                      {selectedAudit.notes}
                    </dd>
                  </div>
                )}
              </dl>

              {/* Close action */}
              <button
                onClick={() => setSelectedAudit(null)}
                className="btn-secondary w-full mt-6"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
