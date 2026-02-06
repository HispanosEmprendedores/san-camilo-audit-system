import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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
    if (score >= 80) return 'text-emerald-600 font-bold'
    if (score >= 60) return 'text-amber-600 font-bold'
    return 'text-red-600 font-bold'
  }

  function exportPDF() {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(30, 41, 59) // slate-800
    doc.text('San Camilo - Reporte de Auditorias', 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139) // slate-500
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 30)

    // Line separator
    doc.setDrawColor(226, 232, 240) // slate-200
    doc.line(14, 34, 196, 34)

    // Table
    autoTable(doc, {
      startY: 40,
      head: [['Local', 'Auditorias', 'Puntaje Promedio', 'Tendencia', 'Ultima Auditoria']],
      body: reports.map((r) => [
        r.storeName,
        String(r.totalAudits),
        `${r.averageScore}%`,
        r.trend === 'up' ? 'Mejorando' : r.trend === 'down' ? 'Bajando' : 'Estable',
        r.lastAuditDate
          ? new Date(r.lastAuditDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
          : '-',
      ]),
      headStyles: {
        fillColor: [67, 73, 230], // brand-600
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 65, 85], // slate-700
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // slate-50
      },
      styles: {
        cellPadding: 4,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184) // slate-400
      doc.text(
        `San Camilo - Sistema de Auditorias | Pagina ${i} de ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      )
    }

    doc.save(`reporte-auditorias-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (loading) {
    return (
      <div className="animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-7 w-7 text-slate-400" />
          <div>
            <div className="h-7 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-slate-100 rounded animate-pulse mt-1.5" />
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-3.5">
            <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-slate-100 flex items-center gap-6">
              <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-16 bg-slate-100 rounded animate-pulse ml-auto" />
              <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-10 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-slate-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reportes</h1>
            <p className="text-[15px] text-slate-500">Resumen de rendimiento por local</p>
          </div>
        </div>
        <button
          onClick={exportPDF}
          disabled={reports.length === 0}
          className="btn-primary text-[13px] py-2 px-4"
        >
          <FileDown size={16} />
          Exportar PDF
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="card overflow-hidden flex flex-col items-center justify-center py-20">
          <BarChart3 size={48} className="text-slate-300" />
          <p className="text-[15px] text-slate-500 mt-4">No hay datos de auditorías para mostrar</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Local
                </th>
                <th className="text-center px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Auditorías
                </th>
                <th className="text-center px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Puntaje Promedio
                </th>
                <th className="text-center px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Tendencia
                </th>
                <th className="text-right px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Última Auditoría
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.storeId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-[13px] font-medium text-slate-900">
                    {report.storeName}
                  </td>
                  <td className="px-6 py-4 text-center text-[13px] text-slate-500">
                    {report.totalAudits}
                  </td>
                  <td className="px-6 py-4 text-center text-[13px]">
                    <span className={getScoreColor(report.averageScore)}>
                      {report.averageScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {report.trend === 'up' && (
                      <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto" />
                    )}
                    {report.trend === 'down' && (
                      <TrendingDown className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                    {report.trend === 'stable' && (
                      <span className="text-slate-300 text-[13px]">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] text-slate-500">
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
