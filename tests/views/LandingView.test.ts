import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import LandingView from '@/views/LandingView.vue'
import { i18n } from '@/i18n'

const authStoreMock = {
  isAuthenticated: false,
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : \'#\'"><slot /></a>',
}

describe('LandingView', () => {
  it('shows public calls to action for guests', () => {
    authStoreMock.isAuthenticated = false

    render(LandingView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Digital Internal Control/i,
      }),
    ).toBeTruthy()
    expect(screen.getByText('Sign In')).toBeTruthy()
    expect(screen.getByText('Get Started')).toBeTruthy()
  })

  it('shows dashboard actions for authenticated users', () => {
    authStoreMock.isAuthenticated = true

    render(LandingView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    expect(screen.getAllByText('Go to Dashboard')).toHaveLength(2)
  })
})
