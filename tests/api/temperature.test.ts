import { describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/client', () => ({
  request: requestMock,
}))

describe('temperatureApi', () => {
  it('builds temperature list, get, and create requests correctly', async () => {
    const { temperatureApi } = await import('@/api/temperature')
    const payload = {
      location: 'Walk-in Fridge',
      temperature: 4,
      minThreshold: 1,
      maxThreshold: 5,
      comment: 'Stable',
    }

    temperatureApi.list('Walk-in Fridge')
    temperatureApi.get(3)
    temperatureApi.create(payload)

    expect(requestMock).toHaveBeenNthCalledWith(
      1,
      '/temperature-logs?location=Walk-in%20Fridge',
    )
    expect(requestMock).toHaveBeenNthCalledWith(2, '/temperature-logs/3')
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      '/temperature-logs',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }),
    )
  })

  it('omits the location query when not provided', async () => {
    const { temperatureApi } = await import('@/api/temperature')

    temperatureApi.list()
    expect(requestMock).toHaveBeenCalledWith('/temperature-logs')
  })
})
