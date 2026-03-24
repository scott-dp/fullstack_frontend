import { request } from './client'

export interface Notification {
  id: number
  title: string
  message: string
  type: string
  read: boolean
  referenceId: number | null
  referenceType: string | null
  createdAt: string
}

export const notificationApi = {
  list: () => request<Notification[]>('/notifications'),
  unreadCount: () => request<number>('/notifications/unread-count'),
  markAsRead: (id: number) => request<void>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () => request<void>('/notifications/read-all', { method: 'PUT' }),
}
