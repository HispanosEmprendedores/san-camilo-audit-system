import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Audit } from '../lib/database.types'

interface AuditWithStore extends Audit {
  store?: { id: string; name: string } | null
}

interface StoreReport {
  storeId: string
  storeName: string
  totalAudits: number
  averageScore: number
  lastAuditDate: string | null
  trend: 'up' | 'down' | 'stable'
}

export default function Reports() {
  const [reports, setReports] = useState<StoreReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      const { data: audits } = await supabase
        .from('audits')
        .select('*, store:stores(id, name)')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })

      if (!audits) {
        setLoading(false)
        return
      }

      const typedAudits = audits as unknown as AuditWithStore[]
      const byStore = new Map<string, { name: string; scores: number[]; lastDate: string }>()

      for (const audit of typedAudits) {
        const storeId = audit.store?.id ?? audit.store_id
        const storeName = audit.store?.name ?? 'Desconocido'

        if (!byStore.has(storeId)) {
          byStore.set(storeId, { name: storeName, scores: [], lastDate: audit.created_at })
        }
        if (audit.score !== null) {
          byStore.get(storeId)!.scores.push(audit.score)
        }
      }

      const storeReports: StoreReport[] = Array.from(byStore.entries()).map(
        ([storeId, data]) => {
          const avg =
            data.scores.length > 0
              ? Math.round(
                  (data.scores.reduce((s, v) => s + v, 0) / data.scores.length) * 10
                ) / 10
              : 0
          const recent = data.scores.slice(0, 3)
          const older = data.scores.slice(3, 6)
          const recentAvg =
            recent.length > 0
              ? recent.reduce((s, v) => s + v, 0) / recent.length
              : 0
          const olderAvg =
            older.length > 0
              ? older.reduce((s, v) => s + v, 0) / older.length
              : recentAvg

          let trend: 'up' | 'down' | 'stable' = 'stable'
          if (recentAvg > olderAvg + 2) trend = 'up'
          else if (recentAvg < olderAvg - 2) trend = 'down'

          return {
            storeId,
            storeName: data.name,
            totalAudits: data.scores.length,
            averageScore: avg,
            lastAuditDate: data.lastDate,
            trend,
          }
        }
      )

      storeReports.sort((a, b) => b.averageScore - a.averageScore)
      setReports(storeReports)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
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
        <BarChart3 className="h-7 w-7 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <p className="text-gray-500">No hay datos de auditorías para mostrar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Local
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auditorías
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntaje Promedio
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tendencia
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Auditoría
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((report) => (
                <tr key={report.storeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {report.storeName}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {report.totalAudits}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${getScoreColor(report.averageScore)}`}>
                      {report.averageScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {report.trend === 'up' && (
                      <TrendingUp className="h-5 w-5 text-green-500 mx-auto" />
                    )}
                    {report.trend === 'down' && (
                      <TrendingDown className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                    {report.trend === 'stable' && (
                      <span className="text-gray-400 text-sm">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    {report.lastAuditDate
                      ? new Date(report.lastAuditDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
