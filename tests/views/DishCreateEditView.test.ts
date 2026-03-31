/**
 * View tests for dish creation and ingredient-derived allergens.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import DishCreateEditView from '../../src/views/food/DishCreateEditView.vue'

const routeMock = { params: {} }
const pushMock = vi.fn()

const { listIngredientsMock, createDishMock } = vi.hoisted(() => ({
  listIngredientsMock: vi.fn(),
  createDishMock: vi.fn(),
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
    listIngredients: listIngredientsMock,
    createDish: createDishMock,
    getDish: vi.fn(),
    updateDish: vi.fn(),
  },
}))

describe('DishCreateEditView', () => {
  beforeEach(() => {
    listIngredientsMock.mockReset()
    createDishMock.mockReset()
    pushMock.mockReset()
  })

  it('creates a dish with selected ingredients and shows derived allergens', async () => {
    listIngredientsMock.mockResolvedValue([
      {
        id: 1,
        name: 'Salmon',
        notes: null,
        allergens: [{ id: 2, code: 'FISH', nameNo: 'Fisk', nameEn: 'Fish' }],
        createdAt: '2026-03-20T10:00:00',
        updatedAt: '2026-03-20T10:00:00',
      },
    ])
    createDishMock.mockResolvedValue({})

    render(DishCreateEditView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    await screen.findByPlaceholderText('Dish name')
    await fireEvent.update(screen.getByPlaceholderText('Dish name'), 'Seafood Pasta')
    await fireEvent.update(screen.getByDisplayValue('Add an ingredient...'), '1')

    expect(screen.getByText('FISH - Fish')).toBeTruthy()

    await fireEvent.update(screen.getByPlaceholderText('Quantity (optional)'), '200 g')
    await fireEvent.click(screen.getByRole('button', { name: 'Create Dish' }))

    await waitFor(() => {
      expect(createDishMock).toHaveBeenCalledWith({
        name: 'Seafood Pasta',
        description: undefined,
        notes: undefined,
        ingredientIds: [{ ingredientId: 1, quantityText: '200 g' }],
      })
      expect(pushMock).toHaveBeenCalledWith('/app/dishes')
    })
  })
})
