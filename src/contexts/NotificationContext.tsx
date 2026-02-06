import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface Notification {
  id: string
  user_id: string
  type: 'photo_pending' | 'photo_approved' | 'photo_rejected' | 'audit_completed'
  title: string
  message: string
  read: boolean
  metadata: Record<string, string> | null
  created_at: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  loading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    async function fetchNotifications() {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
      } else {
        setNotifications((data as unknown as Notification[]) ?? [])
      }
      setLoading(false)
    }

    fetchNotifications()

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification
          setNotifications((prev) => [newNotif, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    if (error) {
      console.error('Error marking notification as read:', error)
      return
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  async function markAllAsRead() {
    if (!user) return

    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, loading }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider')
  }
  return context
}
