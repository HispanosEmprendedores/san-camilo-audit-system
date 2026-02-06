import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al iniciar sesion. Verifica tus credenciales.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[-60px] w-[300px] h-[300px] rounded-full bg-brand-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">SC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">San Camilo</h1>
              <p className="text-xs text-slate-400 font-medium">Sistema de Auditorias</p>
            </div>
          </div>

          <h2 className="text-[40px] font-extrabold text-white leading-tight tracking-tight mb-6">
            Gestion de<br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
              auditorias
            </span>{' '}
            inteligente
          </h2>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm">
            Plataforma ejecutiva para la gestion, seguimiento y analisis de auditorias
            de locales comerciales en tiempo real.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-slate-500 text-sm">
          <div>
            <p className="text-2xl font-bold text-white">99.9%</p>
            <p className="text-xs mt-0.5">Disponibilidad</p>
          </div>
          <div className="w-px h-10 bg-slate-700" />
          <div>
            <p className="text-2xl font-bold text-white">256-bit</p>
            <p className="text-xs mt-0.5">Encriptacion</p>
          </div>
          <div className="w-px h-10 bg-slate-700" />
          <div>
            <p className="text-2xl font-bold text-white">RLS</p>
            <p className="text-xs mt-0.5">Seguridad</p>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">SC</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">San Camilo</h1>
              <p className="text-xs text-slate-500">Sistema de Auditorias</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[26px] font-bold text-slate-900 tracking-tight">Bienvenido</h2>
            <p className="text-slate-500 mt-1.5 text-[15px]">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 bg-danger-50 border border-danger-100 text-danger-600 px-4 py-3.5 rounded-xl text-sm animate-slide-up">
                <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Correo electronico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Contrasena
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-11"
                  placeholder="Tu contrasena"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-[14px] mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Iniciar Sesion
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[12px] text-slate-400 mt-8">
            Plataforma protegida con autenticacion segura
          </p>
        </div>
      </div>
    </div>
  )
}
