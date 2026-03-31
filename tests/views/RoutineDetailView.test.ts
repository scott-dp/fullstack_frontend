/**
 * View tests for routine details and review actions.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import RoutineDetailView from '../../src/views/routines/RoutineDetailView.vue'

const routeMock = { params: { id: '12' } }
const pushMock = vi.fn()

const { getMock, historyMock, reviewMock, authStoreMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  historyMock: vi.fn(),
  reviewMock: vi.fn(),
  authStoreMock: {
    hasManageAccess: true,
  },
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
    get: getMock,
    history: historyMock,
    review: reviewMock,
    archive: vi.fn(),
    unarchive: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('RoutineDetailView', () => {
  beforeEach(() => {
    getMock.mockReset()
    historyMock.mockReset()
    reviewMock.mockReset()
    pushMock.mockReset()
    authStoreMock.hasManageAccess = true
  })

  it('loads routine details and submits a review', async () => {
    getMock
      .mockResolvedValueOnce({
        id: 12,
        name: 'Daily cleaning',
        moduleType: 'IK_MAT',
        category: 'CLEANING',
        description: 'Clean surfaces',
        purpose: null,
        responsibleRole: 'MANAGER',
        frequencyType: 'DAILY',
        stepsText: null,
        whatIsDeviationText: null,
        correctiveActionText: null,
        requiredEvidenceText: null,
        linkedChecklistTemplateId: null,
        linkedChecklistTemplateName: null,
        active: true,
        reviewIntervalDays: 30,
        lastReviewedAt: null,
        versionNumber: 1,
        createdByUsername: 'admin',
        createdAt: '2026-03-01T10:00:00',
        updatedAt: '2026-03-01T10:00:00',
      })
      .mockResolvedValueOnce({
        id: 12,
        name: 'Daily cleaning',
        moduleType: 'IK_MAT',
        category: 'CLEANING',
        description: 'Clean surfaces',
        purpose: null,
        responsibleRole: 'MANAGER',
        frequencyType: 'DAILY',
        stepsText: null,
        whatIsDeviationText: null,
        correctiveActionText: null,
        requiredEvidenceText: null,
        linkedChecklistTemplateId: null,
        linkedChecklistTemplateName: null,
        active: true,
        reviewIntervalDays: 30,
        lastReviewedAt: '2026-03-31T10:00:00',
        versionNumber: 1,
        createdByUsername: 'admin',
        createdAt: '2026-03-01T10:00:00',
        updatedAt: '2026-03-31T10:00:00',
      })
    historyMock.mockResolvedValue([])
    reviewMock.mockResolvedValue({
      id: 5,
      routineId: 12,
      reviewedByUsername: 'manager',
      reviewedAt: '2026-03-31T10:00:00',
      notes: 'Looks good',
      nextReviewAt: '2026-04-30T10:00:00',
    })

    render(RoutineDetailView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(await screen.findByText('Daily cleaning')).toBeTruthy()
    await fireEvent.update(screen.getByPlaceholderText('Review notes (optional)...'), 'Looks good')
    await fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }))

    await waitFor(() => {
      expect(reviewMock).toHaveBeenCalledWith(12, 'Looks good')
      expect(getMock).toHaveBeenCalledTimes(2)
    })
  })
})
