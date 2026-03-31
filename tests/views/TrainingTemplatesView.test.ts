/**
 * View tests for the training template library.
 */
import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import TrainingTemplatesView from '../../src/views/training/TrainingTemplatesView.vue'

const pushMock = vi.fn()

const { listTemplatesMock, authStoreMock } = vi.hoisted(() => ({
  listTemplatesMock: vi.fn(),
  authStoreMock: {
    hasManageAccess: true,
  },
}))

vi.mock('@/api/operations/trainings.ts', () => ({
  trainingApi: {
    listTemplates: listTemplatesMock,
  },
}))

vi.mock('@/stores/auth.ts', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('TrainingTemplatesView', () => {
  beforeEach(() => {
    listTemplatesMock.mockReset()
    pushMock.mockReset()
    authStoreMock.hasManageAccess = true
  })

  it('renders templates, filters by module, and navigates from a card', async () => {
    listTemplatesMock.mockResolvedValue([
      {
        id: 4,
        title: 'Responsible serving',
        moduleType: 'IK_ALKOHOL',
        category: 'SERVICE',
        description: 'Serve responsibly',
        contentText: null,
        requiredForRole: 'STAFF',
        isMandatory: true,
        validityDays: 365,
        acknowledgmentRequired: true,
        active: true,
        createdAt: '2026-03-20T10:00:00',
        updatedAt: '2026-03-20T10:00:00',
      },
      {
        id: 5,
        title: 'Kitchen hygiene',
        moduleType: 'IK_MAT',
        category: 'HYGIENE',
        description: 'Daily kitchen hygiene',
        contentText: null,
        requiredForRole: 'ALL',
        isMandatory: false,
        validityDays: null,
        acknowledgmentRequired: false,
        active: true,
        createdAt: '2026-03-20T10:00:00',
        updatedAt: '2026-03-20T10:00:00',
      },
    ])

    render(TrainingTemplatesView, {
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

    expect(await screen.findByText('Responsible serving')).toBeTruthy()
    expect(screen.getByText('Kitchen hygiene')).toBeTruthy()

    await fireEvent.update(screen.getByDisplayValue('All Modules'), 'IK_MAT')

    expect(screen.getByText('Kitchen hygiene')).toBeTruthy()
    expect(screen.queryByText('Responsible serving')).toBeNull()

    await fireEvent.click(screen.getByText('Kitchen hygiene'))
    expect(pushMock).toHaveBeenCalledWith('/app/training/templates/5')
  })
})
