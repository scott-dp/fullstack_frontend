import { defineStore } from 'pinia'
import { ref } from 'vue'
import { notificationApi, type Notification } from '@/api/notifications'

/**
 * Notification store managing the current user's notifications.
 * Tracks the full notification list and a separate unread count
 * used by the header badge.
 */
export const useNotificationStore = defineStore('notifications', () => {
  /** Full list of notifications fetched from the server. */
  const notifications = ref<Notification[]>([])

  /** Count of unread notifications, used for the header badge. */
  const unreadCount = ref(0)

  /** Fetches all notifications for the current user from the server. */
  async function fetchNotifications() {
    try {
      notifications.value = await notificationApi.list()
    } catch {
      notifications.value = []
    }
  }

  /** Fetches only the unread notification count from the server. */
  async function fetchUnreadCount() {
    try {
      unreadCount.value = await notificationApi.unreadCount()
    } catch {
      unreadCount.value = 0
    }
  }

  /**
   * Marks a single notification as read on the server and updates local state.
   * @param id - Notification identifier
   */
  async function markAsRead(id: number) {
    await notificationApi.markAsRead(id)
    const n = notifications.value.find((item) => item.id === id)
    if (n) n.read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  /** Marks all notifications as read on the server and updates local state. */
  async function markAllAsRead() {
    await notificationApi.markAllAsRead()
    notifications.value.forEach((item) => { item.read = true })
    unreadCount.value = 0
  }

  return { notifications, unreadCount, fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead }
})
