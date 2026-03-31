/**
 * View tests for temperature logging.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import TemperatureView from '../../src/views/temperature/TemperatureView.vue'

const { listMock, createMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
  createMock: vi.fn(),
}))

vi.mock('@/api/operations/temperature.ts', () => ({
  temperatureApi: {
    list: listMock,
    create: createMock,
  },
}))

describe('TemperatureView', () => {
  beforeEach(() => {
    listMock.mockReset()
    createMock.mockReset()
  })

  it('creates a new temperature log and prepends it to the table', async () => {
    listMock.mockResolvedValue([])
    createMock.mockResolvedValue({
      id: 1,
      location: 'Fridge A',
      temperature: 3.4,
      minThreshold: -2,
      maxThreshold: 4,
      status: 'NORMAL',
      recordedByUsername: 'manager',
      recordedAt: '2026-03-31T10:00:00',
      comment: 'Stable',
    })

    render(TemperatureView, {
      global: { plugins: [i18n] },
    })

    expect(await screen.findByText('No temperature logs')).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: 'Log Temperature' }))

    const textboxes = screen.getAllByRole('textbox')
    const spinbuttons = screen.getAllByRole('spinbutton')
    await fireEvent.update(textboxes[0], 'Fridge A')
    await fireEvent.update(spinbuttons[0], '3.4')
    await fireEvent.update(textboxes[1], 'Stable')
    await fireEvent.click(screen.getByRole('button', { name: 'Record' }))

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith({
        location: 'Fridge A',
        temperature: 3.4,
        minThreshold: -2,
        maxThreshold: 4,
        comment: 'Stable',
      })
      expect(screen.getByText('Fridge A')).toBeTruthy()
    })
  })
})
