import { render, fireEvent, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import LoginView from '@/views/LoginView.vue'
import { HttpError } from '@/api/client'
import { i18n } from '@/i18n'

const pushMock = vi.fn()
const authStoreMock = {
  loading: false,
  login: vi.fn(),
}
const routeMock = {
  query: {},
}

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
    useRoute: () => routeMock,
  }
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : \'#\'"><slot /></a>',
}

describe('LoginView', () => {
  it('submits credentials and redirects to the requested route', async () => {
    routeMock.query = { redirect: '/app' }
    authStoreMock.login.mockResolvedValue(undefined)

    render(LoginView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    await fireEvent.update(screen.getByLabelText('Username'), 'alice')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret')
    await fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(authStoreMock.login).toHaveBeenCalledWith({ username: 'alice', password: 'secret' })
    expect(pushMock).toHaveBeenCalledWith('/app')
  })

  it('shows the API error message on failed login', async () => {
    routeMock.query = {}
    authStoreMock.login.mockRejectedValue(
      new HttpError({
        timestamp: new Date().toISOString(),
        status: 401,
        message: 'Invalid credentials',
        errors: {},
      }),
    )

    render(LoginView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    await fireEvent.update(screen.getByLabelText('Username'), 'alice')
    await fireEvent.update(screen.getByLabelText('Password'), 'wrong')
    await fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText('Invalid credentials')).toBeTruthy()
  })
})
