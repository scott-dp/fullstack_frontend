/**
 * Contract tests for allergen, ingredient, and dish API helpers.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/core/client.ts', () => ({
  request: requestMock,
}))

describe('allergenApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('uses the expected allergen, ingredient, and dish endpoints', async () => {
    const { allergenApi } = await import('../../src/api/operations/allergens')

    allergenApi.listAllergens()
    allergenApi.listIngredients()
    allergenApi.getIngredient(2)
    allergenApi.createIngredient({ name: 'Butter', allergenIds: [1] })
    allergenApi.updateIngredient(2, { notes: 'Updated' })
    allergenApi.deleteIngredient(2)
    allergenApi.listDishes()
    allergenApi.getDish(6)
    allergenApi.createDish({ name: 'Toast', ingredientIds: [{ ingredientId: 2 }] })
    allergenApi.updateDish(6, { notes: 'Updated dish' })
    allergenApi.deleteDish(6)
    allergenApi.approveDish(6)
    allergenApi.addOverride(6, { allergenId: 4, included: false, reason: 'Manual exclusion' })
    allergenApi.removeOverride(6, 10)
    allergenApi.getAllergenSheet()

    expect(requestMock).toHaveBeenNthCalledWith(1, '/allergens')
    expect(requestMock).toHaveBeenNthCalledWith(2, '/ingredients')
    expect(requestMock).toHaveBeenNthCalledWith(3, '/ingredients/2')
    expect(requestMock).toHaveBeenNthCalledWith(4, '/ingredients', expect.objectContaining({ method: 'POST' }))
    expect(requestMock).toHaveBeenNthCalledWith(5, '/ingredients/2', expect.objectContaining({ method: 'PUT' }))
    expect(requestMock).toHaveBeenNthCalledWith(6, '/ingredients/2', expect.objectContaining({ method: 'DELETE' }))
    expect(requestMock).toHaveBeenNthCalledWith(7, '/dishes')
    expect(requestMock).toHaveBeenNthCalledWith(8, '/dishes/6')
    expect(requestMock).toHaveBeenNthCalledWith(9, '/dishes', expect.objectContaining({ method: 'POST' }))
    expect(requestMock).toHaveBeenNthCalledWith(10, '/dishes/6', expect.objectContaining({ method: 'PUT' }))
    expect(requestMock).toHaveBeenNthCalledWith(11, '/dishes/6', expect.objectContaining({ method: 'DELETE' }))
    expect(requestMock).toHaveBeenNthCalledWith(12, '/dishes/6/approve', expect.objectContaining({ method: 'POST' }))
    expect(requestMock).toHaveBeenNthCalledWith(
      13,
      '/dishes/6/overrides',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ allergenId: 4, included: false, reason: 'Manual exclusion' }),
      }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(14, '/dishes/6/overrides/10', expect.objectContaining({ method: 'DELETE' }))
    expect(requestMock).toHaveBeenNthCalledWith(15, '/dishes/allergen-sheet')
  })
})
