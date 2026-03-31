/**
 * View tests for routine creation.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import RoutineCreateView from '../../src/views/routines/RoutineCreateView.vue'

const pushMock = vi.fn()

const { createRoutineMock } = vi.hoisted(() => ({
  createRoutineMock: vi.fn(),
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
  }
})

vi.mock('@/api/operations/routines.ts', () => ({
  routineApi: {
    create: createRoutineMock,
  },
}))

describe('RoutineCreateView', () => {
  beforeEach(() => {
    createRoutineMock.mockReset()
    pushMock.mockReset()
  })

  it('validates required name before creating a routine', async () => {
    render(RoutineCreateView, {
      global: {
        plugins: [i18n],
      },
    })

    await fireEvent.update(screen.getByPlaceholderText('e.g. Morning fridge temperature control'), '   ')
    await fireEvent.click(screen.getByRole('button', { name: 'Create Routine' }))

    expect(screen.getByText('Name is required')).toBeTruthy()
  })

  it('creates a routine and redirects to the detail page', async () => {
    createRoutineMock.mockResolvedValue({ id: 27 })

    render(RoutineCreateView, {
      global: {
        plugins: [i18n],
      },
    })

    await fireEvent.update(screen.getByPlaceholderText('e.g. Morning fridge temperature control'), 'Opening checklist')
    await fireEvent.update(screen.getByPlaceholderText('What this routine covers...'), 'Opening tasks before service')
    await fireEvent.click(screen.getByRole('button', { name: 'Create Routine' }))

    await waitFor(() => {
      expect(createRoutineMock).toHaveBeenCalledWith({
        name: 'Opening checklist',
        moduleType: 'IK_MAT',
        category: 'HYGIENE',
        description: 'Opening tasks before service',
        purpose: '',
        responsibleRole: 'STAFF',
        frequencyType: 'DAILY',
        stepsText: '',
        whatIsDeviationText: '',
        correctiveActionText: '',
        requiredEvidenceText: '',
        reviewIntervalDays: 30,
      })
      expect(pushMock).toHaveBeenCalledWith('/app/routines/27')
    })
  })
})
