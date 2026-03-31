/**
 * View tests for dish detail actions and allergen overrides.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import DishDetailView from '../../src/views/food/DishDetailView.vue'

const routeMock = { params: { id: '6' } }
const pushMock = vi.fn()

const {
  getDishMock,
  listAllergensMock,
  approveDishMock,
  addOverrideMock,
  authStoreMock,
} = vi.hoisted(() => ({
  getDishMock: vi.fn(),
  listAllergensMock: vi.fn(),
  approveDishMock: vi.fn(),
  addOverrideMock: vi.fn(),
  authStoreMock: {
    hasManageAccess: true,
  },
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => routeMock,
    useRouter: () => ({ push: pushMock }),
  }
})

vi.mock('@/api/operations/allergens.ts', () => ({
  allergenApi: {
    getDish: getDishMock,
    listAllergens: listAllergensMock,
    approveDish: approveDishMock,
    addOverride: addOverrideMock,
    removeOverride: vi.fn(),
    deleteDish: vi.fn(),
  },
}))

vi.mock('@/stores/auth.ts', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('DishDetailView', () => {
  beforeEach(() => {
    getDishMock.mockReset()
    listAllergensMock.mockReset()
    approveDishMock.mockReset()
    addOverrideMock.mockReset()
    pushMock.mockReset()
    authStoreMock.hasManageAccess = true
  })

  it('loads a dish, approves it, and adds an override', async () => {
    const initialDish = {
      id: 6,
      name: 'Seafood Pasta',
      description: 'Creamy seafood pasta',
      active: true,
      ingredients: [{ id: 1, ingredientId: 1, ingredientName: 'Salmon', quantityText: '200 g' }],
      derivedAllergens: [{ id: 2, code: 'FISH', nameNo: 'Fisk', nameEn: 'Fish' }],
      overrides: [],
      changedSinceApproval: true,
      lastApprovedAt: null,
      lastApprovedByUsername: null,
      notes: null,
      createdAt: '2026-03-20T10:00:00',
      updatedAt: '2026-03-20T10:00:00',
    }
    const approvedDish = {
      ...initialDish,
      changedSinceApproval: false,
      lastApprovedAt: '2026-03-31T12:00:00',
      lastApprovedByUsername: 'manager',
    }
    const updatedDish = {
      ...approvedDish,
      overrides: [
        {
          id: 44,
          allergen: { id: 5, code: 'MILK', nameNo: 'Melk', nameEn: 'Milk' },
          included: true,
          reason: 'Cream sauce',
        },
      ],
    }

    getDishMock.mockResolvedValue(initialDish)
    listAllergensMock.mockResolvedValue([
      { id: 5, code: 'MILK', nameNo: 'Melk', nameEn: 'Milk' },
    ])
    approveDishMock.mockResolvedValue(approvedDish)
    addOverrideMock.mockResolvedValue({
      id: 44,
      allergen: { id: 5, code: 'MILK', nameNo: 'Melk', nameEn: 'Milk' },
      included: true,
      reason: 'Cream sauce',
    })
    getDishMock.mockResolvedValueOnce(initialDish).mockResolvedValueOnce(updatedDish)

    render(DishDetailView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(await screen.findByText('Seafood Pasta')).toBeTruthy()
    expect(screen.getByText('Needs approval')).toBeTruthy()
    expect(screen.getByText('Fish')).toBeTruthy()

    await fireEvent.click(screen.getByRole('button', { name: 'Approve Allergens' }))

    await waitFor(() => {
      expect(approveDishMock).toHaveBeenCalledWith(6)
      expect(screen.getByText('Approved')).toBeTruthy()
    })

    await fireEvent.update(screen.getByDisplayValue('Select allergen...'), '5')
    await fireEvent.update(screen.getByPlaceholderText('Reason...'), 'Cream sauce')
    await fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(addOverrideMock).toHaveBeenCalledWith(6, { allergenId: 5, included: true, reason: 'Cream sauce' })
      expect(screen.getByText('Milk: Included')).toBeTruthy()
    })
  })
})
