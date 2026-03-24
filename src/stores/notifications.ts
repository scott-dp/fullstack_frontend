import { defineStore } from 'pinia'
import { ref } from 'vue'
import { notificationApi, type Notification } from '@/api/notifications'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)

  async function fetchNotifications() {
    notifications.value = await notificationApi.list()
  }

  async function fetchUnreadCount() {
    unreadCount.value = await notificationApi.unreadCount()
  }

  async function markAsRead(id: number) {
    await notificationApi.markAsRead(id)
    const n = notifications.value.find((item) => item.id === id)
    if (n) n.read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  async function markAllAsRead() {
    await notificationApi.markAllAsRead()
    notifications.value.forEach((item) => { item.read = true })
    unreadCount.value = 0
  }

  return { notifications, unreadCount, fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead }
})
