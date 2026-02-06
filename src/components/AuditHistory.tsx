import { useEffect, useState } from 'react'
import { History, Eye, Search } from 'lucide-react'
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
    if (score === null) return 'text-gray-400'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  function getScoreBg(score: number | null) {
    if (score === null) return 'bg-gray-100'
    if (score >= 80) return 'bg-green-50'
    if (score >= 60) return 'bg-amber-50'
    return 'bg-red-50'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <History className="h-7 w-7 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Historial de Auditorías</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por local..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <p className="text-gray-500">No se encontraron auditorías</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((audit) => (
            <div
              key={audit.id}
              className="bg-white rounded-xl shadow-sm border p-5 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {audit.store?.name ?? 'Local'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(audit.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <span
                  className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
                    audit.status === 'completed'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {audit.status === 'completed' ? 'Completada' : 'En progreso'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-center px-4 py-2 rounded-lg ${getScoreBg(audit.score)}`}>
                  <p className={`text-2xl font-bold ${getScoreColor(audit.score)}`}>
                    {audit.score !== null ? `${audit.score}%` : '-'}
                  </p>
                  <p className="text-xs text-gray-500">Puntaje</p>
                </div>
                <button
                  onClick={() => setSelectedAudit(audit)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Detalle de Auditoría</h2>
              <button
                onClick={() => setSelectedAudit(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Local</dt>
                <dd className="text-gray-900">
                  {selectedAudit.store?.name ?? '-'}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Fecha</dt>
                <dd className="text-gray-900">
                  {new Date(selectedAudit.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Puntaje</dt>
                <dd className={`font-bold ${getScoreColor(selectedAudit.score)}`}>
                  {selectedAudit.score !== null ? `${selectedAudit.score}%` : 'Sin puntaje'}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Estado</dt>
                <dd className="text-gray-900">
                  {selectedAudit.status === 'completed' ? 'Completada' : 'En progreso'}
                </dd>
              </div>
              {selectedAudit.notes && (
                <div>
                  <dt className="font-medium text-gray-500">Notas</dt>
                  <dd className="text-gray-900">{selectedAudit.notes}</dd>
                </div>
              )}
            </dl>
            <button
              onClick={() => setSelectedAudit(null)}
              className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
