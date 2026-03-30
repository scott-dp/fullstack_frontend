/**
 * View tests for the not-found page.
 */
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import NotFoundView from '@/views/NotFoundView.vue'

vi.mock('@/components/layout/AppShell.vue', () => ({
  default: {
    template: '<div><slot /></div>',
  },
}))

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : \'#\'"><slot /></a>',
}

describe('NotFoundView', () => {
  it('renders the starter 404 message', () => {
    render(NotFoundView, {
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    expect(screen.getByText('404')).toBeTruthy()
    expect(screen.getByText(/starter setup/i)).toBeTruthy()
    expect(screen.getByText(/Back to home/i)).toBeTruthy()
  })
})
