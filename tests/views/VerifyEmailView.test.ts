/**
 * View tests for email verification.
 */
import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import VerifyEmailView from '../../src/views/auth/VerifyEmailView.vue'

const routeMock = { query: { token: 'abc-token' as string | undefined } }

const { verifyEmailMock } = vi.hoisted(() => ({
  verifyEmailMock: vi.fn(),
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => routeMock,
  }
})

vi.mock('@/api/auth/auth.ts', () => ({
  authApi: {
    verifyEmail: verifyEmailMock,
  },
}))

describe('VerifyEmailView', () => {
  beforeEach(() => {
    verifyEmailMock.mockReset()
    routeMock.query.token = 'abc-token'
  })

  it('shows success when verification completes', async () => {
    verifyEmailMock.mockResolvedValue({ message: 'Email verified successfully' })

    render(VerifyEmailView, {
      global: {
        plugins: [i18n],
        stubs: { RouterLink: { props: ['to'], template: '<a><slot /></a>' } },
      },
    })

    expect(await screen.findByText('Email verified successfully')).toBeTruthy()
  })

  it('shows missing token error when token is absent', async () => {
    routeMock.query.token = undefined

    render(VerifyEmailView, {
      global: {
        plugins: [i18n],
        stubs: { RouterLink: { props: ['to'], template: '<a><slot /></a>' } },
      },
    })

    expect(await screen.findByText('Verification token is missing')).toBeTruthy()
  })
})
