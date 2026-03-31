/**
 * View tests for training template creation.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import TrainingTemplateCreateView from '../../src/views/training/TrainingTemplateCreateView.vue'

const pushMock = vi.fn()

const { createTemplateMock } = vi.hoisted(() => ({
  createTemplateMock: vi.fn(),
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
  }
})

vi.mock('@/api/operations/trainings.ts', () => ({
  trainingApi: {
    createTemplate: createTemplateMock,
  },
}))

describe('TrainingTemplateCreateView', () => {
  beforeEach(() => {
    createTemplateMock.mockReset()
    pushMock.mockReset()
  })

  it('validates required title before submitting', async () => {
    render(TrainingTemplateCreateView, {
      global: {
        plugins: [i18n],
      },
    })

    await fireEvent.update(screen.getByPlaceholderText('e.g. Basic food hygiene'), '   ')
    await fireEvent.click(screen.getByRole('button', { name: 'Create Template' }))

    expect(screen.getByText('Title is required')).toBeTruthy()
    expect(createTemplateMock).not.toHaveBeenCalled()
  })

  it('creates a template and redirects to the templates list', async () => {
    createTemplateMock.mockResolvedValue({ id: 4 })

    render(TrainingTemplateCreateView, {
      global: {
        plugins: [i18n],
      },
    })

    await fireEvent.update(screen.getByPlaceholderText('e.g. Basic food hygiene'), 'Food safety basics')
    await fireEvent.update(screen.getByPlaceholderText('Full training material text...'), 'Wash hands and monitor temperatures')
    await fireEvent.click(screen.getByRole('button', { name: 'Create Template' }))

    await waitFor(() => {
      expect(createTemplateMock).toHaveBeenCalledWith({
        title: 'Food safety basics',
        moduleType: 'IK_MAT',
        category: 'FOOD_HYGIENE',
        description: '',
        contentText: 'Wash hands and monitor temperatures',
        requiredForRole: 'ALL',
        isMandatory: false,
        validityDays: undefined,
        acknowledgmentRequired: true,
      })
      expect(pushMock).toHaveBeenCalledWith('/app/training')
    })
  })
})
