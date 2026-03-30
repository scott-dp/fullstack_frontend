import { render, fireEvent, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import AdminSetupView from '../../src/views/admin/AdminSetupView.vue'
import { i18n } from '@/i18n'
import { HttpError } from '../../src/api/core/client'

const { pushMock, routeMock, authApiMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  routeMock: {
    query: { token: 'setup-token' },
  },
  authApiMock: {
    getAdminSetupInfo: vi.fn(),
    completeAdminSetup: vi.fn(),
  },
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
    useRoute: () => routeMock,
  }
})

vi.mock('@/api/auth/auth.ts', () => {
  return {
    authApi: authApiMock,
  }
})

describe('AdminSetupView', () => {
  it('loads setup info and completes account setup', async () => {
    vi.useFakeTimers()
    authApiMock.getAdminSetupInfo.mockResolvedValue({
      email: 'ava@example.com',
      firstName: 'Ava',
      lastName: 'Nilsen',
      organizationName: 'North Peak Bistro',
    })
    authApiMock.completeAdminSetup.mockResolvedValue({
      message: 'Account setup complete. You can now log in.',
    })

    const { container } = render(AdminSetupView, {
      global: {
        plugins: [i18n],
      },
    })

    expect(await screen.findByDisplayValue('ava@example.com')).toBeTruthy()
    const passwordInputs = container.querySelectorAll('input[type="password"]')

    await fireEvent.update(passwordInputs[0], 'superSecret123')
    await fireEvent.update(passwordInputs[1], 'superSecret123')
    await fireEvent.click(screen.getByRole('button', { name: 'Activate account' }))

    expect(authApiMock.completeAdminSetup).toHaveBeenCalledWith({
      token: 'setup-token',
      password: 'superSecret123',
    })
    expect(await screen.findByText('Account setup complete. You can now log in.')).toBeTruthy()

    await vi.advanceTimersByTimeAsync(1200)
    expect(pushMock).toHaveBeenCalledWith({ name: 'login' })
    vi.useRealTimers()
  })

  it('shows safe frontend errors from setup completion', async () => {
    authApiMock.getAdminSetupInfo.mockResolvedValue({
      email: 'ava@example.com',
      firstName: 'Ava',
      lastName: 'Nilsen',
      organizationName: 'North Peak Bistro',
    })
    authApiMock.completeAdminSetup.mockRejectedValue(
      new HttpError({
        timestamp: new Date().toISOString(),
        status: 400,
        message: 'Setup token has expired',
        errors: {},
      }),
    )

    const { container } = render(AdminSetupView, {
      global: {
        plugins: [i18n],
      },
    })

    await screen.findByDisplayValue('ava@example.com')
    const passwordInputs = container.querySelectorAll('input[type="password"]')
    await fireEvent.update(passwordInputs[0], 'superSecret123')
    await fireEvent.update(passwordInputs[1], 'superSecret123')
    await fireEvent.click(screen.getByRole('button', { name: 'Activate account' }))

    expect(
      await screen.findByText('This setup link is invalid or has expired. Ask for a new admin invitation.'),
    ).toBeTruthy()
  })
})
