import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AppShell from '@/components/layout/AppShell.vue'

const pushMock = vi.fn()
const routeMock = { name: 'dashboard' }
const authStoreMock = {
  isAuthenticated: true,
  logout: vi.fn(),
}

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => routeMock,
    useRouter: () => ({ push: pushMock }),
  }
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : \'#\'"><slot /></a>',
}

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a dashboard title and signs out authenticated users', async () => {
    routeMock.name = 'dashboard'
    authStoreMock.isAuthenticated = true
    authStoreMock.logout.mockResolvedValue(undefined)

    render(AppShell, {
      slots: {
        default: '<div>Page content</div>',
      },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    expect(screen.getByRole('heading', { name: 'Workspace' })).toBeTruthy()
    expect(screen.getByText('Page content')).toBeTruthy()

    await fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

    expect(authStoreMock.logout).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith({ name: 'home' })
  })

  it('renders the authentication title and login link for guests', () => {
    routeMock.name = 'login'
    authStoreMock.isAuthenticated = false

    render(AppShell, {
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    expect(screen.getByRole('heading', { name: 'Authentication' })).toBeTruthy()
    expect(screen.getByText('Login')).toBeTruthy()
  })
})
