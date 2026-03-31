/**
 * View tests for the training report dashboard.
 */
import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import TrainingReportView from '../../src/views/training/TrainingReportView.vue'

const { reportMock } = vi.hoisted(() => ({
  reportMock: vi.fn(),
}))

vi.mock('@/api/operations/trainings.ts', () => ({
  trainingApi: {
    report: reportMock,
  },
}))

describe('TrainingReportView', () => {
  beforeEach(() => {
    reportMock.mockReset()
  })

  it('loads and renders the training report metrics', async () => {
    reportMock.mockResolvedValue({
      totalTemplates: 5,
      totalAssignments: 17,
      completedCount: 12,
      overdueCount: 2,
      completionRate: 70.4,
    })

    render(TrainingReportView, {
      global: {
        plugins: [i18n],
      },
    })

    expect(await screen.findByText('17')).toBeTruthy()
    expect(screen.getByText('Training completed')).toBeTruthy()
    expect(screen.getByText('70%')).toBeTruthy()
    expect(screen.getByText('Needing attention')).toBeTruthy()
  })
})
