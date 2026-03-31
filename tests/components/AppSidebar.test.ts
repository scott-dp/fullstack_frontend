/**
 * Component tests for grouped sidebar navigation and disclosure accessibility.
 */
import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import AppSidebar from '@/components/AppSidebar.vue'

const routeMock = { path: '/app' }
const authStoreMock = {
  isSuperAdmin: false,
  hasManageAccess: true,
  isAdmin: true,
  user: {
    organizationName: 'Everest',
  },
}

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => routeMock,
  }
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'Primary navigation': 'Primary navigation',
      Operations: 'Operations',
      'Food Management': 'Food Management',
      'Incidents & Follow-up': 'Incidents & Follow-up',
      'Supply Chain': 'Supply Chain',
      Training: 'Training',
      Account: 'Account',
      Dashboard: 'Dashboard',
      Dishes: 'Dishes',
      Ingredients: 'Ingredients',
      'Allergen Sheet': 'Allergen Sheet',
      Suppliers: 'Suppliers',
      Deliveries: 'Deliveries',
      Traceability: 'Traceability',
      Bevilling: 'Bevilling',
      'Admin Panel': 'Admin Panel',
      'User Management': 'User Management',
      Routines: 'Routines',
      Checklists: 'Checklists',
      History: 'History',
      Temperature: 'Temperature',
      Deviations: 'Deviations',
      Incidents: 'Incidents',
      Notifications: 'Notifications',
      Settings: 'Settings',
      'My Training': 'My Training',
      'Platform Access': 'Platform Access',
      'No organization': 'No organization',
      Superadmin: 'Superadmin',
    },
  },
})

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : \'#\'"><slot /></a>',
}

describe('AppSidebar', () => {
  beforeEach(() => {
    routeMock.path = '/app'
    authStoreMock.isSuperAdmin = false
    authStoreMock.hasManageAccess = true
    authStoreMock.isAdmin = true
  })

  it('renders grouped navigation with expanded state for the active section', () => {
    routeMock.path = '/app/dishes'

    render(AppSidebar, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    const foodToggle = screen.getByRole('button', { name: /Food Management/i })
    expect(foodToggle.getAttribute('aria-expanded')).toBe('true')
    expect(foodToggle.getAttribute('aria-controls')).toBe('sidebar-group-food')
    expect(screen.getByText('Allergen Sheet')).toBeTruthy()
  })

  it('toggles collapsed group state when the group button is clicked', async () => {
    render(AppSidebar, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    const supplyToggle = screen.getByRole('button', { name: /Supply Chain/i })
    expect(supplyToggle.getAttribute('aria-expanded')).toBe('false')

    await fireEvent.click(supplyToggle)

    expect(supplyToggle.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Traceability')).toBeTruthy()
  })
})
