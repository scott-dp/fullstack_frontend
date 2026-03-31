/**
 * View tests for the personal training inbox.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import MyTrainingView from '../../src/views/training/MyTrainingView.vue'

const { myAssignmentsMock, completeMock } = vi.hoisted(() => ({
  myAssignmentsMock: vi.fn(),
  completeMock: vi.fn(),
}))

vi.mock('@/api/operations/trainings.ts', () => ({
  trainingApi: {
    myAssignments: myAssignmentsMock,
    complete: completeMock,
  },
}))

describe('MyTrainingView', () => {
  beforeEach(() => {
    myAssignmentsMock.mockReset()
    completeMock.mockReset()
  })

  it('completes an assigned training after acknowledgment', async () => {
    myAssignmentsMock.mockResolvedValue([
      {
        id: 9,
        templateId: 4,
        templateTitle: 'Responsible serving',
        assigneeUsername: 'staff1',
        assignedByUsername: 'manager',
        assignedAt: '2026-03-24T10:00:00',
        dueAt: '2026-04-05T00:00:00',
        status: 'ASSIGNED',
      },
    ])
    completeMock.mockResolvedValue({
      id: 1,
      assignmentId: 9,
      completedByUsername: 'staff1',
      completedAt: '2026-03-25T12:00:00',
      acknowledgementChecked: true,
      comments: 'Done',
      expiresAt: null,
    })

    render(MyTrainingView, {
      global: {
        plugins: [i18n],
      },
    })

    expect(await screen.findByText('Responsible serving')).toBeTruthy()

    await fireEvent.click(screen.getByRole('button', { name: 'Mark as Completed' }))
    await fireEvent.click(screen.getByRole('checkbox'))
    await fireEvent.update(screen.getByPlaceholderText('Comments (optional)...'), 'Done')
    await fireEvent.click(screen.getByRole('button', { name: 'Confirm Completion' }))

    await waitFor(() => {
      expect(completeMock).toHaveBeenCalledWith(9, true, 'Done')
      expect(screen.getAllByText('Completed').length).toBeGreaterThan(0)
    })
  })
})
