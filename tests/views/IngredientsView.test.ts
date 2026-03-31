/**
 * View tests for the ingredients list.
 */
import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import IngredientsView from '../../src/views/food/IngredientsView.vue'

const pushMock = vi.fn()

const { listIngredientsMock, authStoreMock } = vi.hoisted(() => ({
  listIngredientsMock: vi.fn(),
  authStoreMock: {
    hasManageAccess: true,
  },
}))

vi.mock('@/api/operations/allergens.ts', () => ({
  allergenApi: {
    listIngredients: listIngredientsMock,
  },
}))

vi.mock('@/stores/auth.ts', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('IngredientsView', () => {
  beforeEach(() => {
    listIngredientsMock.mockReset()
    pushMock.mockReset()
  })

  it('renders ingredient rows and supports keyboard navigation', async () => {
    listIngredientsMock.mockResolvedValue([
      {
        id: 4,
        name: 'Salmon',
        notes: 'Fresh fish',
        allergens: [{ id: 2, code: 'FISH', nameNo: 'Fisk', nameEn: 'Fish' }],
        createdAt: '2026-03-20T10:00:00',
        updatedAt: '2026-03-20T10:00:00',
      },
    ])

    render(IngredientsView, {
      global: {
        plugins: [i18n],
        mocks: { $router: { push: pushMock } },
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    expect(await screen.findByText('Salmon')).toBeTruthy()
    expect(screen.getByText('FISH')).toBeTruthy()
    await fireEvent.keyDown(screen.getByText('Salmon').closest('tr')!, { key: 'Enter' })
    expect(pushMock).toHaveBeenCalledWith('/app/ingredients/4/edit')
  })
})
