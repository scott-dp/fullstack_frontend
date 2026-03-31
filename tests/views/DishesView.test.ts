/**
 * View tests for the dishes list.
 */
import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DishesView from '../../src/views/food/DishesView.vue'
import { i18n } from '@/i18n'

const pushMock = vi.fn()

const { listDishesMock, authStoreMock } = vi.hoisted(() => ({
  listDishesMock: vi.fn(),
  authStoreMock: {
    hasManageAccess: true,
  },
}))

vi.mock('@/api/operations/allergens.ts', () => ({
  allergenApi: {
    listDishes: listDishesMock,
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('DishesView', () => {
  beforeEach(() => {
    listDishesMock.mockReset()
    pushMock.mockReset()
    authStoreMock.hasManageAccess = true
  })

  it('renders dish allergens with included overrides and removes excluded overrides', async () => {
    listDishesMock.mockResolvedValue([
      {
        id: 6,
        name: 'Seafood Pasta',
        description: null,
        active: true,
        ingredients: [],
        derivedAllergens: [
          { id: 1, code: 'GLUTEN', nameNo: 'Gluten', nameEn: 'Gluten' },
          { id: 2, code: 'FISH', nameNo: 'Fisk', nameEn: 'Fish' },
        ],
        overrides: [
          { id: 3, allergen: { id: 1, code: 'GLUTEN', nameNo: 'Gluten', nameEn: 'Gluten' }, included: false, reason: 'Excluded' },
          { id: 4, allergen: { id: 5, code: 'MILK', nameNo: 'Melk', nameEn: 'Milk' }, included: true, reason: 'Included' },
        ],
        changedSinceApproval: true,
        lastApprovedAt: null,
        lastApprovedByUsername: null,
        notes: null,
        createdAt: '2026-03-20T10:00:00',
        updatedAt: '2026-03-20T10:00:00',
      },
    ])

    render(DishesView, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: { push: pushMock },
        },
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(await screen.findByText('Seafood Pasta')).toBeTruthy()
    expect(screen.queryByText('GLUTEN')).toBeNull()
    expect(screen.getByText('FISH')).toBeTruthy()
    expect(screen.getByText('MILK')).toBeTruthy()
    expect(screen.getByText('Needs approval')).toBeTruthy()

    await fireEvent.keyDown(screen.getByText('Seafood Pasta').closest('tr')!, { key: 'Enter' })
    expect(pushMock).toHaveBeenCalledWith('/app/dishes/6')
  })
})
