import { describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/core/client.ts', () => ({
  request: requestMock,
}))

describe('notificationApi', () => {
  it('uses the expected notification endpoints', async () => {
    const { notificationApi } = await import('../../src/api/operations/notifications')

    notificationApi.list()
    notificationApi.unreadCount()
    notificationApi.markAsRead(9)
    notificationApi.markAllAsRead()

    expect(requestMock).toHaveBeenNthCalledWith(1, '/notifications')
    expect(requestMock).toHaveBeenNthCalledWith(2, '/notifications/unread-count')
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      '/notifications/9/read',
      expect.objectContaining({ method: 'PUT' }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      4,
      '/notifications/read-all',
      expect.objectContaining({ method: 'PUT' }),
    )
  })
})
