/**
 * Layout tests for the authenticated application shell.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import AppLayout from '../../src/layouts/AppLayout.vue'

const pushMock = vi.fn()

const { authStoreMock, notificationStoreMock, setLocaleMock } = vi.hoisted(() => ({
  authStoreMock: {
    isSuperAdmin: false,
    user: { username: 'manager1', firstName: 'Mia' },
    logout: vi.fn(),
  },
  notificationStoreMock: {
    unreadCount: 3,
    fetchUnreadCount: vi.fn(),
  },
  setLocaleMock: vi.fn(),
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
  }
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

vi.mock('@/stores/notifications', () => ({
  useNotificationStore: () => notificationStoreMock,
}))

vi.mock('@/i18n', async () => {
  const actual = await vi.importActual<typeof import('@/i18n')>('@/i18n')
  return {
    ...actual,
    setI18nLocale: setLocaleMock,
  }
})

describe('AppLayout', () => {
  beforeEach(() => {
    pushMock.mockReset()
    setLocaleMock.mockReset()
    authStoreMock.isSuperAdmin = false
    authStoreMock.user = { username: 'manager1', firstName: 'Mia' }
    authStoreMock.logout.mockReset()
    authStoreMock.logout.mockResolvedValue(undefined)
    notificationStoreMock.unreadCount = 3
    notificationStoreMock.fetchUnreadCount.mockReset()
  })

  it('fetches unread notifications for non-superadmins and logs out', async () => {
    render(AppLayout, {
      global: {
        plugins: [i18n],
        stubs: {
          AppSidebar: { template: '<aside>Sidebar</aside>' },
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
          RouterView: { template: '<div>Content</div>' },
        },
      },
    })

    expect(notificationStoreMock.fetchUnreadCount).toHaveBeenCalled()
    expect(screen.getByText('Mia')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()

    await fireEvent.click(screen.getByRole('button', { name: 'Log out' }))

    await waitFor(() => {
      expect(authStoreMock.logout).toHaveBeenCalled()
      expect(pushMock).toHaveBeenCalledWith({ name: 'login' })
    })
  })

  it('changes locale through the language selector', async () => {
    render(AppLayout, {
      global: {
        plugins: [i18n],
        stubs: {
          AppSidebar: { template: '<aside>Sidebar</aside>' },
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
          RouterView: { template: '<div>Content</div>' },
        },
      },
    })

    await fireEvent.update(screen.getByRole('combobox'), 'no')
    expect(setLocaleMock).toHaveBeenCalledWith('no')
  })
})
