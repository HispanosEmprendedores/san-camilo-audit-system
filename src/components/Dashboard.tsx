import { useEffect, useState } from 'react'
import { ClipboardCheck, Store, AlertTriangle, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface DashboardStats {
  totalAudits: number
  totalStores: number
  pendingAudits: number
  averageScore: number
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalAudits: 0,
    totalStores: 0,
    pendingAudits: 0,
    averageScore: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const [auditsResult, storesResult, pendingResult] = await Promise.all([
        supabase.from('audits').select('id, score', { count: 'exact' }),
        supabase.from('stores').select('id', { count: 'exact' }),
        supabase
          .from('audits')
          .select('id', { count: 'exact' })
          .eq('status', 'in_progress'),
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
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: 'Total Auditorías',
      value: stats.totalAudits,
      icon: ClipboardCheck,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Locales',
      value: stats.totalStores,
      icon: Store,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
    },
    {
      title: 'En Progreso',
      value: stats.pendingAudits,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
    },
    {
      title: 'Puntaje Promedio',
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {profile?.full_name ?? 'Usuario'}
        </h1>
        <p className="text-gray-500 mt-1">Resumen general del sistema de auditorías</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgLight}`}>
                <card.icon className={`h-6 w-6 text-${card.color.replace('bg-', '')}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
