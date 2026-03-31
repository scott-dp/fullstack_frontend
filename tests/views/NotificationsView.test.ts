/**
 * View tests for notifications.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import NotificationsView from '../../src/views/NotificationsView.vue'

const { storeMock } = vi.hoisted(() => ({
  storeMock: {
    notifications: [] as Array<Record<string, unknown>>,
    fetchNotifications: vi.fn(),
    markAllAsRead: vi.fn(),
    markAsRead: vi.fn(),
  },
}))

vi.mock('@/stores/notifications', () => ({
  useNotificationStore: () => storeMock,
}))

describe('NotificationsView', () => {
  beforeEach(() => {
    storeMock.fetchNotifications.mockReset()
    storeMock.markAllAsRead.mockReset()
    storeMock.markAsRead.mockReset()
    storeMock.notifications = [
      {
        id: 1,
        title: 'Training assigned',
        message: 'You have a new training',
        type: 'TRAINING_ASSIGNED',
        read: false,
        createdAt: '2026-03-25T10:00:00',
      },
    ]
  })

  it('fetches notifications and marks an unread notification as read', async () => {
    render(NotificationsView, {
      global: { plugins: [i18n] },
    })

    expect(storeMock.fetchNotifications).toHaveBeenCalled()
    expect(await screen.findByText('Training assigned')).toBeTruthy()
    await fireEvent.click(screen.getByText('Training assigned'))

    expect(storeMock.markAsRead).toHaveBeenCalledWith(1)
    await fireEvent.click(screen.getByRole('button', { name: 'Mark all as read' }))
    expect(storeMock.markAllAsRead).toHaveBeenCalled()
  })
})
