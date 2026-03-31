/**
 * View tests for ingredient creation and deletion.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import IngredientCreateEditView from '../../src/views/food/IngredientCreateEditView.vue'

const routeMock = { params: {} as Record<string, string> }
const pushMock = vi.fn()

const {
  listAllergensMock,
  createIngredientMock,
  getIngredientMock,
  deleteIngredientMock,
} = vi.hoisted(() => ({
  listAllergensMock: vi.fn(),
  createIngredientMock: vi.fn(),
  getIngredientMock: vi.fn(),
  deleteIngredientMock: vi.fn(),
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
    listAllergens: listAllergensMock,
    createIngredient: createIngredientMock,
    getIngredient: getIngredientMock,
    deleteIngredient: deleteIngredientMock,
    updateIngredient: vi.fn(),
  },
}))

describe('IngredientCreateEditView', () => {
  beforeEach(() => {
    routeMock.params = {}
    listAllergensMock.mockReset()
    createIngredientMock.mockReset()
    getIngredientMock.mockReset()
    deleteIngredientMock.mockReset()
    pushMock.mockReset()
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('creates an ingredient with selected allergens', async () => {
    listAllergensMock.mockResolvedValue([
      { id: 2, code: 'FISH', nameNo: 'Fisk', nameEn: 'Fish' },
    ])
    createIngredientMock.mockResolvedValue({})

    render(IngredientCreateEditView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    await screen.findByPlaceholderText('Ingredient name')
    await fireEvent.update(screen.getByPlaceholderText('Ingredient name'), 'Salmon')
    await fireEvent.click(screen.getByRole('checkbox'))
    await fireEvent.click(screen.getByRole('button', { name: 'Create Ingredient' }))

    await waitFor(() => {
      expect(createIngredientMock).toHaveBeenCalledWith({
        name: 'Salmon',
        notes: undefined,
        allergenIds: [2],
      })
      expect(pushMock).toHaveBeenCalledWith('/app/ingredients')
    })
  })

  it('deletes an existing ingredient in edit mode', async () => {
    routeMock.params = { id: '4' }
    listAllergensMock.mockResolvedValue([{ id: 2, code: 'FISH', nameNo: 'Fisk', nameEn: 'Fish' }])
    getIngredientMock.mockResolvedValue({
      id: 4,
      name: 'Salmon',
      notes: null,
      allergens: [{ id: 2, code: 'FISH', nameNo: 'Fisk', nameEn: 'Fish' }],
      createdAt: '2026-03-20T10:00:00',
      updatedAt: '2026-03-20T10:00:00',
    })
    deleteIngredientMock.mockResolvedValue({})

    render(IngredientCreateEditView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    expect(await screen.findByDisplayValue('Salmon')).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(deleteIngredientMock).toHaveBeenCalledWith(4)
      expect(pushMock).toHaveBeenCalledWith('/app/ingredients')
    })
  })
})
