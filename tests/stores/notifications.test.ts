/**
 * Store tests for notification loading, marking read, and unread counts.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNotificationStore } from '@/stores/notifications'

const { notificationApiMock } = vi.hoisted(() => ({
  notificationApiMock: {
    list: vi.fn(),
    unreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}))

vi.mock('@/api/operations/notifications.ts', () => ({
  notificationApi: notificationApiMock,
}))

describe('notification store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads notifications and unread count', async () => {
    notificationApiMock.list.mockResolvedValue([{ id: 1, read: false, title: 'A', message: 'B' }])
    notificationApiMock.unreadCount.mockResolvedValue(3)
    const store = useNotificationStore()

    await store.fetchNotifications()
    await store.fetchUnreadCount()

    expect(store.notifications).toHaveLength(1)
    expect(store.unreadCount).toBe(3)
  })

  it('marks one notification as read and decrements the unread count', async () => {
    notificationApiMock.markAsRead.mockResolvedValue(undefined)
    const store = useNotificationStore()
    store.notifications = [
      {
        id: 4,
        title: 'Title',
        message: 'Message',
        type: 'GENERAL',
        read: false,
        referenceId: null,
        referenceType: null,
        createdAt: '2026-03-24T10:00:00',
      },
    ]
    store.unreadCount = 2

    await store.markAsRead(4)

    expect(store.notifications[0]?.read).toBe(true)
    expect(store.unreadCount).toBe(1)
  })

  it('does not allow unread count to go below zero', async () => {
    notificationApiMock.markAsRead.mockResolvedValue(undefined)
    const store = useNotificationStore()
    store.unreadCount = 0

    await store.markAsRead(999)

    expect(store.unreadCount).toBe(0)
  })

  it('marks all notifications as read', async () => {
    notificationApiMock.markAllAsRead.mockResolvedValue(undefined)
    const store = useNotificationStore()
    store.notifications = [
      {
        id: 1,
        title: 'Title',
        message: 'Message',
        type: 'GENERAL',
        read: false,
        referenceId: null,
        referenceType: null,
        createdAt: '2026-03-24T10:00:00',
      },
    ]
    store.unreadCount = 4

    await store.markAllAsRead()

    expect(store.notifications.every((notification) => notification.read)).toBe(true)
    expect(store.unreadCount).toBe(0)
  })
})
