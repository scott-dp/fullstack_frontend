/**
 * View tests for checklist history.
 */
import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import ChecklistHistoryView from '../../src/views/checklists/ChecklistHistoryView.vue'

const { listCompletionsMock } = vi.hoisted(() => ({
  listCompletionsMock: vi.fn(),
}))

vi.mock('@/api/operations/checklists.ts', () => ({
  checklistApi: {
    listCompletions: listCompletionsMock,
  },
}))

describe('ChecklistHistoryView', () => {
  beforeEach(() => {
    listCompletionsMock.mockReset()
  })

  it('renders checklist completion history rows', async () => {
    listCompletionsMock.mockResolvedValue([
      {
        id: 1,
        templateTitle: 'Opening Checklist',
        completedByUsername: 'mia',
        completedAt: '2026-03-24T08:00:00',
        status: 'DEVIATION_FOUND',
        comment: 'Cooler was warm',
      },
    ])

    render(ChecklistHistoryView, {
      global: { plugins: [i18n] },
    })

    expect(await screen.findByText('Opening Checklist')).toBeTruthy()
    expect(screen.getByText('mia')).toBeTruthy()
    expect(screen.getByText('Deviation Found')).toBeTruthy()
    expect(screen.getByText('Cooler was warm')).toBeTruthy()
  })
})
