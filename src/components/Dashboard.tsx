import { useEffect, useState } from 'react'
import {
  ClipboardCheck,
  Store,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Audit } from '../lib/database.types'

interface DashboardStats {
  totalAudits: number
  totalStores: number
  pendingAudits: number
  averageScore: number
}

interface AuditWithStore extends Audit {
  store?: { name: string } | null
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalAudits: 0,
    totalStores: 0,
    pendingAudits: 0,
    averageScore: 0,
  })
  const [recentAudits, setRecentAudits] = useState<AuditWithStore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [auditsResult, storesResult, pendingResult, recentResult] = await Promise.all([
        supabase.from('audits').select('id, score', { count: 'exact' }),
        supabase.from('stores').select('id', { count: 'exact' }),
        supabase
          .from('audits')
          .select('id', { count: 'exact' })
          .eq('status', 'in_progress'),
        supabase
          .from('audits')
          .select('*, store:stores(name)')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const audits = auditsResult.data ?? []
      const completedScores = audits
        .map((a) => a.score)
        .filter((s): s is number => s !== null)
      const avg =
        completedScores.length > 0
          ? completedScores.reduce((sum, s) => sum + s, 0) / completedScores.length
          : 0

      setStats({
        totalAudits: auditsResult.count ?? 0,
        totalStores: storesResult.count ?? 0,
        pendingAudits: pendingResult.count ?? 0,
        averageScore: Math.round(avg * 10) / 10,
      })
      setRecentAudits((recentResult.data as unknown as AuditWithStore[]) ?? [])
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const kpis = [
    {
      title: 'Total Auditorias',
      value: stats.totalAudits,
      icon: ClipboardCheck,
      trend: '+12%',
      trendUp: true,
      gradient: 'from-brand-500 to-brand-700',
      iconBg: 'bg-brand-50',
      iconColor: 'text-brand-600',
    },
    {
      title: 'Locales Activos',
      value: stats.totalStores,
      icon: Store,
      trend: '+3',
      trendUp: true,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'En Progreso',
      value: stats.pendingAudits,
      icon: AlertTriangle,
      trend: stats.pendingAudits > 0 ? 'Pendientes' : 'Todo al dia',
      trendUp: stats.pendingAudits === 0,
      gradient: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Puntaje Promedio',
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      trend: stats.averageScore >= 80 ? 'Excelente' : stats.averageScore >= 60 ? 'Bueno' : 'Mejorar',
      trendUp: stats.averageScore >= 70,
      gradient: 'from-violet-500 to-violet-700',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
  ]

  function getScoreColor(score: number | null) {
    if (score === null) return 'text-slate-400'
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  function getScoreBg(score: number | null) {
    if (score === null) return 'bg-slate-100'
    if (score >= 80) return 'bg-emerald-50'
    if (score >= 60) return 'bg-amber-50'
    return 'bg-red-50'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="skeleton h-7 w-56 mb-2" />
          <div className="skeleton h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-10 w-10 rounded-xl mb-4" />
              <div className="skeleton h-4 w-24 mb-2" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="card p-6">
          <div className="skeleton h-5 w-40 mb-6" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-16 w-full mb-3 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Bienvenido, {profile?.full_name?.split(' ')[0] ?? 'Usuario'}
        </h1>
        <p className="text-slate-500 mt-1 text-[15px]">Resumen ejecutivo del sistema de auditorias</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.title}
            className="card p-6 animate-slide-up"
            style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'backwards' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${kpi.iconBg}`}>
                <kpi.icon size={20} className={kpi.iconColor} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${kpi.trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                {kpi.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-[13px] font-medium text-slate-500">{kpi.title}</p>
            <p className="text-[28px] font-bold text-slate-900 tracking-tight mt-0.5">{kpi.value}</p>
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${kpi.gradient} transition-all duration-1000`}
                style={{ width: `${Math.min(typeof kpi.value === 'number' ? Math.max((kpi.value / Math.max(stats.totalAudits, 1)) * 100, 15) : parseFloat(String(kpi.value)) || 15, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card animate-slide-up" style={{ animationDelay: '250ms', animationFillMode: 'backwards' }}>
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-900">Actividad Reciente</h3>
              <p className="text-[13px] text-slate-500 mt-0.5">Ultimas auditorias registradas</p>
            </div>
            <Clock size={18} className="text-slate-400" />
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {recentAudits.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ClipboardCheck size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No hay auditorias registradas aun</p>
            </div>
          ) : (
            recentAudits.map((audit) => (
              <div key={audit.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/80 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getScoreBg(audit.score)}`}>
                  <span className={`text-sm font-bold ${getScoreColor(audit.score)}`}>
                    {audit.score !== null ? audit.score : '--'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-slate-800 truncate">
                    {audit.store?.name ?? 'Local'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar size={12} className="text-slate-400" />
                    <span className="text-[12px] text-slate-500">
                      {new Date(audit.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <span
                  className={`badge ${
                    audit.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {audit.status === 'completed' ? 'Completada' : 'En progreso'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
