import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import RegisterView from '@/views/RegisterView.vue'
import { HttpError } from '@/api/client'
import { i18n } from '@/i18n'

const pushMock = vi.fn()
const authStoreMock = {
  loading: false,
  register: vi.fn(),
}

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

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : \'#\'"><slot /></a>',
}

describe('RegisterView', () => {
  it('shows a validation error when passwords do not match', async () => {
    render(RegisterView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    await fireEvent.update(screen.getByLabelText('Username'), 'alice')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret123')
    await fireEvent.update(screen.getByLabelText('Confirm Password'), 'different123')
    await fireEvent.click(screen.getByRole('button', { name: 'Register' }))

    expect(await screen.findByText('Passwords do not match')).toBeTruthy()
    expect(authStoreMock.register).not.toHaveBeenCalled()
  })

  it('registers and redirects on success', async () => {
    authStoreMock.register.mockResolvedValue(undefined)

    render(RegisterView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    await fireEvent.update(screen.getByLabelText('Username'), 'alice')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret123')
    await fireEvent.update(screen.getByLabelText('Confirm Password'), 'secret123')
    await fireEvent.click(screen.getByRole('button', { name: 'Register' }))

    expect(authStoreMock.register).toHaveBeenCalledWith({
      username: 'alice',
      password: 'secret123',
    })
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('shows the API error message on failed registration', async () => {
    authStoreMock.register.mockRejectedValue(
      new HttpError({
        timestamp: new Date().toISOString(),
        status: 409,
        message: 'Username already exists',
        errors: {},
      }),
    )

    render(RegisterView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    await fireEvent.update(screen.getByLabelText('Username'), 'alice')
    await fireEvent.update(screen.getByLabelText('Password'), 'secret123')
    await fireEvent.update(screen.getByLabelText('Confirm Password'), 'secret123')
    await fireEvent.click(screen.getByRole('button', { name: 'Register' }))

    expect(await screen.findByText('Username already exists')).toBeTruthy()
  })
})
