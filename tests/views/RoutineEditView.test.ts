/**
 * View tests for routine editing.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import RoutineEditView from '../../src/views/routines/RoutineEditView.vue'

const routeMock = { params: { id: '15' } }
const pushMock = vi.fn()

const { getRoutineMock, updateRoutineMock } = vi.hoisted(() => ({
  getRoutineMock: vi.fn(),
  updateRoutineMock: vi.fn(),
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => routeMock,
    useRouter: () => ({ push: pushMock }),
  }
})

vi.mock('@/api/operations/routines.ts', () => ({
  routineApi: {
    get: getRoutineMock,
    update: updateRoutineMock,
  },
}))

describe('RoutineEditView', () => {
  beforeEach(() => {
    getRoutineMock.mockReset()
    updateRoutineMock.mockReset()
    pushMock.mockReset()
  })

  it('loads an existing routine and saves changes', async () => {
    getRoutineMock.mockResolvedValue({
      id: 15,
      name: 'Closing routine',
      moduleType: 'IK_ALKOHOL',
      category: 'CLOSING',
      description: 'Close the bar safely',
      purpose: 'Avoid mistakes',
      responsibleRole: 'MANAGER',
      frequencyType: 'DAILY',
      stepsText: 'Lock all fridges',
      whatIsDeviationText: 'Missed checks',
      correctiveActionText: 'Report to manager',
      requiredEvidenceText: 'Closing notes',
      reviewIntervalDays: 30,
    })
    updateRoutineMock.mockResolvedValue({ id: 15 })

    render(RoutineEditView, {
      global: {
        plugins: [i18n],
      },
    })

    expect(await screen.findByDisplayValue('Closing routine')).toBeTruthy()
    await fireEvent.update(screen.getByDisplayValue('Closing routine'), 'Updated closing routine')
    await fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

    await waitFor(() => {
      expect(updateRoutineMock).toHaveBeenCalledWith(15, {
        name: 'Updated closing routine',
        moduleType: 'IK_ALKOHOL',
        category: 'CLOSING',
        description: 'Close the bar safely',
        purpose: 'Avoid mistakes',
        responsibleRole: 'MANAGER',
        frequencyType: 'DAILY',
        stepsText: 'Lock all fridges',
        whatIsDeviationText: 'Missed checks',
        correctiveActionText: 'Report to manager',
        requiredEvidenceText: 'Closing notes',
        reviewIntervalDays: 30,
      })
      expect(pushMock).toHaveBeenCalledWith('/app/routines/15')
    })
  })
})
