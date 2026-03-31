/**
 * View tests for deviation details and workflow actions.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import DeviationDetailView from '../../src/views/deviations/DeviationDetailView.vue'

const routeMock = { params: { id: '1' } }

const {
  getMock,
  updateMock,
  addCommentMock,
  listUsersMock,
  authStoreMock,
} = vi.hoisted(() => ({
  getMock: vi.fn(),
  updateMock: vi.fn(),
  addCommentMock: vi.fn(),
  listUsersMock: vi.fn(),
  authStoreMock: {
    hasManageAccess: true,
  },
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => routeMock,
  }
})

vi.mock('@/api/operations/deviations.ts', () => ({
  deviationApi: {
    get: getMock,
    update: updateMock,
    addComment: addCommentMock,
  },
}))

vi.mock('@/api/auth/users.ts', () => ({
  userApi: {
    list: listUsersMock,
  },
}))

vi.mock('@/stores/auth.ts', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('DeviationDetailView', () => {
  beforeEach(() => {
    getMock.mockReset()
    updateMock.mockReset()
    addCommentMock.mockReset()
    listUsersMock.mockReset()
    authStoreMock.hasManageAccess = true
  })

  it('loads a deviation, updates status, and posts a comment', async () => {
    getMock.mockResolvedValue({
      id: 1,
      title: 'Broken cooler',
      description: 'Cooling system is too warm',
      category: 'FOOD',
      severity: 'HIGH',
      status: 'OPEN',
      reportedByUsername: 'staff',
      assignedToUsername: null,
      resolvedByUsername: null,
      resolvedAt: null,
      createdAt: '2026-03-24T09:00:00',
      updatedAt: '2026-03-24T09:00:00',
      comments: [],
    })
    listUsersMock.mockResolvedValue([
      { id: 1, username: 'manager', firstName: 'Mia', lastName: 'Manager', roles: ['ROLE_MANAGER'] },
    ])
    updateMock.mockResolvedValue({
      id: 1,
      title: 'Broken cooler',
      description: 'Cooling system is too warm',
      category: 'FOOD',
      severity: 'HIGH',
      status: 'IN_PROGRESS',
      reportedByUsername: 'staff',
      assignedToUsername: null,
      resolvedByUsername: null,
      resolvedAt: null,
      createdAt: '2026-03-24T09:00:00',
      updatedAt: '2026-03-24T09:15:00',
      comments: [],
    })
    addCommentMock.mockResolvedValue({
      id: 11,
      authorUsername: 'manager',
      content: 'Technician booked.',
      createdAt: '2026-03-24T10:00:00',
    })

    render(DeviationDetailView, {
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

    expect(await screen.findByText('Broken cooler')).toBeTruthy()
    expect(screen.getAllByText('Unassigned').length).toBeGreaterThan(0)

    await fireEvent.click(screen.getByRole('button', { name: 'In Progress' }))

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(1, { status: 'IN_PROGRESS' })
      expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0)
    })

    await fireEvent.update(screen.getByPlaceholderText('Add a comment...'), 'Technician booked.')
    await fireEvent.click(screen.getByRole('button', { name: 'Post Comment' }))

    await waitFor(() => {
      expect(addCommentMock).toHaveBeenCalledWith(1, 'Technician booked.')
      expect(screen.getByText('Technician booked.')).toBeTruthy()
    })
  })
})
