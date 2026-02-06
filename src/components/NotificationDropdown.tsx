import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, Image, ClipboardCheck, X } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'

function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'hace un momento'
  if (diffMinutes < 60) return `hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
  if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  return `hace ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'photo_pending':
      return <Image size={18} className="text-amber-500" />
    case 'photo_approved':
      return <Check size={18} className="text-emerald-500" />
    case 'photo_rejected':
      return <X size={18} className="text-red-500" />
    case 'audit_completed':
      return <ClipboardCheck size={18} className="text-brand-500" />
    default:
      return <Bell size={18} className="text-slate-400" />
  }
}

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    setOpen((prev) => !prev)
  }

  async function handleNotificationClick(id: string, read: boolean) {
    if (!read) {
      await markAsRead(id)
    }
  }

  async function handleMarkAllAsRead() {
    await markAllAsRead()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] card shadow-elevated rounded-xl overflow-hidden animate-slide-up z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[15px] font-semibold text-slate-900">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-[11px] font-semibold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 text-[12px] font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                <CheckCheck size={14} />
                Marcar todas como leidas
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Bell size={22} className="text-slate-300" />
                </div>
                <p className="text-[13px] text-slate-400 font-medium">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.read)}
                  className={`w-full text-left px-5 py-3.5 flex items-start gap-3.5 hover:bg-slate-50 transition-colors ${
                    !notification.read ? 'border-l-2 border-brand-500 bg-brand-50/50' : 'border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-900 leading-snug">
                      {notification.title}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {getRelativeTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 bg-brand-500 rounded-full mt-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
