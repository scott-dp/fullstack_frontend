/**
 * View tests for training template details and delete actions.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import TrainingTemplateDetailView from '../../src/views/training/TrainingTemplateDetailView.vue'

const routeMock = { params: { id: '9' } }
const pushMock = vi.fn()

const { getTemplateMock, deleteTemplateMock, authStoreMock } = vi.hoisted(() => ({
  getTemplateMock: vi.fn(),
  deleteTemplateMock: vi.fn(),
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

vi.mock('@/api/operations/trainings.ts', () => ({
  trainingApi: {
    getTemplate: getTemplateMock,
    deleteTemplate: deleteTemplateMock,
  },
}))

vi.mock('@/stores/auth.ts', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('TrainingTemplateDetailView', () => {
  beforeEach(() => {
    getTemplateMock.mockReset()
    deleteTemplateMock.mockReset()
    pushMock.mockReset()
    authStoreMock.hasManageAccess = true
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('loads and renders the training template details', async () => {
    getTemplateMock.mockResolvedValue({
      id: 9,
      title: 'Age control basics',
      moduleType: 'IK_ALKOHOL',
      category: 'AGE_CONTROL',
      description: 'Check IDs carefully',
      contentText: 'Always verify age before serving',
      requiredForRole: 'STAFF',
      isMandatory: true,
      validityDays: 365,
      acknowledgmentRequired: true,
      active: true,
      createdAt: '2026-03-20T10:00:00',
      updatedAt: '2026-03-21T10:00:00',
    })

    render(TrainingTemplateDetailView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    expect(await screen.findByText('Age control basics')).toBeTruthy()
    expect(screen.getByText('Check IDs carefully')).toBeTruthy()
    expect(screen.getByText('Always verify age before serving')).toBeTruthy()
    expect(screen.getByText('Mandatory')).toBeTruthy()
    expect(screen.getByText('Valid for 365 days')).toBeTruthy()
  })

  it('deletes a template after confirmation', async () => {
    getTemplateMock.mockResolvedValue({
      id: 9,
      title: 'Age control basics',
      moduleType: 'IK_ALKOHOL',
      category: 'AGE_CONTROL',
      description: null,
      contentText: null,
      requiredForRole: 'STAFF',
      isMandatory: false,
      validityDays: null,
      acknowledgmentRequired: false,
      active: true,
      createdAt: '2026-03-20T10:00:00',
      updatedAt: '2026-03-21T10:00:00',
    })
    deleteTemplateMock.mockResolvedValue(undefined)

    render(TrainingTemplateDetailView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    await screen.findByText('Age control basics')
    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(deleteTemplateMock).toHaveBeenCalledWith(9)
      expect(pushMock).toHaveBeenCalledWith('/app/training')
    })
  })
})
