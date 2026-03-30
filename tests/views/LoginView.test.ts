import { render, fireEvent, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import LoginView from '@/views/LoginView.vue'
import { HttpError } from '@/api/client'
import { i18n } from '@/i18n'

const pushMock = vi.fn()
const authStoreMock = {
  loading: false,
  login: vi.fn(),
  requestEmailCode: vi.fn(),
  loginWithEmailCode: vi.fn(),
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

    await fireEvent.update(screen.getByLabelText('Email or username'), 'alice@example.com')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret')
    await fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(authStoreMock.login).toHaveBeenCalledWith({ identifier: 'alice@example.com', password: 'secret' })
    expect(pushMock).toHaveBeenCalledWith('/app')
  })

  it('shows a safe frontend error message on failed login', async () => {
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

    await fireEvent.update(screen.getByLabelText('Email or username'), 'alice')
    await fireEvent.update(screen.getByLabelText('Password'), 'wrong')
    await fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText('Invalid username, email, or password')).toBeTruthy()
  })

  it('requests an email login code and logs in with it', async () => {
    routeMock.query = { redirect: '/app' }
    authStoreMock.requestEmailCode.mockResolvedValue({ message: 'A login code has been sent to your email.' })
    authStoreMock.loginWithEmailCode.mockResolvedValue(undefined)

    render(LoginView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    await fireEvent.update(screen.getByLabelText('Email'), 'alice@example.com')
    await fireEvent.click(screen.getByRole('button', { name: 'Send login code' }))

    expect(authStoreMock.requestEmailCode).toHaveBeenCalledWith({ email: 'alice@example.com' })
    expect(await screen.findByText('A login code has been sent to your email.')).toBeTruthy()

    await fireEvent.update(screen.getByLabelText('Login code'), '123456')
    await fireEvent.click(screen.getByRole('button', { name: 'Sign in with email code' }))

    expect(authStoreMock.loginWithEmailCode).toHaveBeenCalledWith({
      email: 'alice@example.com',
      code: '123456',
    })
    expect(pushMock).toHaveBeenCalledWith('/app')
  })
})
