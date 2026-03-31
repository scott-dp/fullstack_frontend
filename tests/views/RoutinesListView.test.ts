/**
 * View tests for the routines list.
 */
import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import RoutinesListView from '../../src/views/routines/RoutinesListView.vue'

const pushMock = vi.fn()

const { listRoutinesMock, authStoreMock } = vi.hoisted(() => ({
  listRoutinesMock: vi.fn(),
  authStoreMock: {
    hasManageAccess: true,
  },
}))

vi.mock('@/api/operations/routines.ts', () => ({
  routineApi: {
    list: listRoutinesMock,
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('RoutinesListView', () => {
  beforeEach(() => {
    listRoutinesMock.mockReset()
    pushMock.mockReset()
    authStoreMock.hasManageAccess = true
  })

  it('filters routines and highlights overdue reviews', async () => {
    listRoutinesMock.mockResolvedValue([
      {
        id: 11,
        name: 'Daily cleaning',
        moduleType: 'IK_MAT',
        category: 'CLEANING',
        description: null,
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
        lastReviewedAt: '2025-01-01T00:00:00',
        versionNumber: 1,
        createdByUsername: 'admin',
        createdAt: '2026-03-20T10:00:00',
        updatedAt: '2026-03-20T10:00:00',
      },
      {
        id: 12,
        name: 'Age control',
        moduleType: 'IK_ALKOHOL',
        category: 'AGE_CONTROL',
        description: null,
        purpose: null,
        responsibleRole: 'STAFF',
        frequencyType: 'SHIFT_BASED',
        stepsText: null,
        whatIsDeviationText: null,
        correctiveActionText: null,
        requiredEvidenceText: null,
        linkedChecklistTemplateId: null,
        linkedChecklistTemplateName: null,
        active: false,
        reviewIntervalDays: null,
        lastReviewedAt: null,
        versionNumber: 1,
        createdByUsername: 'admin',
        createdAt: '2026-03-20T10:00:00',
        updatedAt: '2026-03-20T10:00:00',
      },
    ])

    render(RoutinesListView, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: { push: pushMock },
        },
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(await screen.findByText('Daily cleaning')).toBeTruthy()
    expect(screen.getByText('Review overdue')).toBeTruthy()

    const selects = screen.getAllByRole('combobox')
    await fireEvent.update(selects[2], 'false')

    expect(screen.queryByText('Daily cleaning')).toBeNull()
    expect(screen.getByText('Age control')).toBeTruthy()

    await fireEvent.keyDown(screen.getByText('Age control').closest('tr')!, { key: 'Enter' })
    expect(pushMock).toHaveBeenCalledWith('/app/routines/12')
  })
})
