/**
 * View tests for the training assignment workflow.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import TrainingAssignView from '../../src/views/training/TrainingAssignView.vue'

const pushMock = vi.fn()
const routeMock = { params: { id: '4' } }

const { getTemplateMock, assignMock, userListMock } = vi.hoisted(() => ({
  getTemplateMock: vi.fn(),
  assignMock: vi.fn(),
  userListMock: vi.fn(),
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
    assign: assignMock,
  },
}))

vi.mock('@/api/auth/users.ts', () => ({
  userApi: {
    list: userListMock,
  },
}))

describe('TrainingAssignView', () => {
  beforeEach(() => {
    getTemplateMock.mockReset()
    assignMock.mockReset()
    userListMock.mockReset()
    pushMock.mockReset()
  })

  it('loads the template and assigns training to selected users', async () => {
    getTemplateMock.mockResolvedValue({
      id: 4,
      title: 'Responsible serving',
      moduleType: 'ALCOHOL',
      category: 'SERVICE',
      description: 'Serve responsibly',
      contentText: null,
      requiredForRole: 'ROLE_STAFF',
      isMandatory: true,
      validityDays: null,
      acknowledgmentRequired: true,
      active: true,
      createdAt: '2026-03-20T10:00:00',
      updatedAt: '2026-03-20T10:00:00',
    })
    userListMock.mockResolvedValue([
      { id: 1, username: 'staff1', firstName: 'Ava', lastName: 'Stone', roles: ['ROLE_STAFF'] },
      { id: 2, username: 'staff2', firstName: 'Noah', lastName: 'West', roles: ['ROLE_STAFF'] },
    ])
    assignMock.mockResolvedValue([])

    const { container } = render(TrainingAssignView, {
      global: {
        plugins: [i18n],
      },
    })

    expect(await screen.findByText('Responsible serving')).toBeTruthy()

    await fireEvent.click(screen.getByLabelText(/staff1/i))
    const dueDateInput = container.querySelector('input[type="date"]')
    if (!dueDateInput) {
      throw new Error('Expected due date input')
    }
    await fireEvent.update(dueDateInput, '2026-04-05')
    await fireEvent.click(screen.getByRole('button', { name: 'Assign to 1 user(s)' }))

    await waitFor(() => {
      expect(assignMock).toHaveBeenCalledWith(4, [1], '2026-04-05')
      expect(screen.getByText('Training assigned to 1 user(s)')).toBeTruthy()
    })
  })

  it('shows a validation message when trying to assign without selecting users', async () => {
    getTemplateMock.mockResolvedValue({
      id: 4,
      title: 'Responsible serving',
      moduleType: 'ALCOHOL',
      category: 'SERVICE',
      description: null,
      contentText: null,
      requiredForRole: 'ROLE_STAFF',
      isMandatory: true,
      validityDays: null,
      acknowledgmentRequired: true,
      active: true,
      createdAt: '2026-03-20T10:00:00',
      updatedAt: '2026-03-20T10:00:00',
    })
    userListMock.mockResolvedValue([{ id: 1, username: 'staff1', firstName: null, lastName: null, roles: ['ROLE_STAFF'] }])

    render(TrainingAssignView, {
      global: {
        plugins: [i18n],
      },
    })

    await screen.findByText('Responsible serving')
    await fireEvent.click(screen.getByText('Select All'))
    await fireEvent.click(screen.getByText('Deselect All'))
    await fireEvent.click(screen.getByRole('button', { name: 'Assign to 0 user(s)' }))

    expect(screen.getByText('Select at least one user')).toBeTruthy()
    expect(assignMock).not.toHaveBeenCalled()
  })
})
