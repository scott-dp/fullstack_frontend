/**
 * View tests for the allergen sheet.
 */
import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import AllergenSheetView from '../../src/views/food/AllergenSheetView.vue'

const printMock = vi.fn()

const { getAllergenSheetMock, listAllergensMock } = vi.hoisted(() => ({
  getAllergenSheetMock: vi.fn(),
  listAllergensMock: vi.fn(),
}))

vi.mock('@/api/operations/allergens.ts', () => ({
  allergenApi: {
    getAllergenSheet: getAllergenSheetMock,
    listAllergens: listAllergensMock,
  },
}))

describe('AllergenSheetView', () => {
  beforeEach(() => {
    getAllergenSheetMock.mockReset()
    listAllergensMock.mockReset()
    printMock.mockReset()
    vi.stubGlobal('print', printMock)
  })

  it('renders allergen matrix and triggers print', async () => {
    getAllergenSheetMock.mockResolvedValue([
      {
        dishName: 'Seafood Pasta',
        allergenCode: 'FISH',
        allergenNameNo: 'Fisk',
        allergenNameEn: 'Fish',
        present: true,
        overridden: false,
      },
    ])
    listAllergensMock.mockResolvedValue([
      { id: 1, code: 'FISH', nameNo: 'Fisk', nameEn: 'Fish' },
    ])

    render(AllergenSheetView, {
      global: { plugins: [i18n] },
    })

    expect(await screen.findByText('Seafood Pasta')).toBeTruthy()
    expect(screen.getAllByText('X').length).toBeGreaterThan(0)

    await fireEvent.click(screen.getByRole('button', { name: 'Print' }))
    expect(printMock).toHaveBeenCalled()
  })
})
