/**
 * View tests for the superadmin dashboard.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SuperAdminDashboardView from '../../src/views/admin/SuperAdminDashboardView.vue'

const { listAdminsMock, createAdminMock, archiveAdminMock, listOrganizationsMock } = vi.hoisted(() => ({
  listAdminsMock: vi.fn(),
  createAdminMock: vi.fn(),
  archiveAdminMock: vi.fn(),
  listOrganizationsMock: vi.fn(),
}))

vi.mock('@/api/admin/superAdmin.ts', () => ({
  superAdminApi: {
    listOrganizationAdmins: listAdminsMock,
    createOrganizationAdmin: createAdminMock,
    archiveOrganizationAdmin: archiveAdminMock,
  },
}))

vi.mock('@/api/admin/organizations.ts', () => ({
  organizationApi: {
    list: listOrganizationsMock,
  },
}))

describe('SuperAdminDashboardView', () => {
  beforeEach(() => {
    listAdminsMock.mockReset()
    createAdminMock.mockReset()
    archiveAdminMock.mockReset()
    listOrganizationsMock.mockReset()
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('loads counts, creates an org admin invite, and archives an admin', async () => {
    listAdminsMock
      .mockResolvedValueOnce([
        {
          id: 1,
          organizationName: 'Everest',
          firstName: 'Alice',
          lastName: 'Admin',
          username: 'alice',
          email: 'alice@example.com',
          active: true,
          setupPending: true,
          createdAt: '2026-03-31T10:00:00',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 2,
          organizationName: 'New Org',
          firstName: 'Bob',
          lastName: 'Boss',
          username: 'bob',
          email: 'bob@example.com',
          active: true,
          setupPending: true,
          createdAt: '2026-03-31T11:00:00',
        },
      ])
    listOrganizationsMock
      .mockResolvedValueOnce([{ id: 8, name: 'Everest' }])
      .mockResolvedValueOnce([{ id: 8, name: 'Everest' }, { id: 9, name: 'New Org' }])
    createAdminMock.mockResolvedValue({
      id: 2,
      organizationName: 'New Org',
      firstName: 'Bob',
      lastName: 'Boss',
      username: 'bob',
      email: 'bob@example.com',
      active: true,
      setupPending: true,
      createdAt: '2026-03-31T11:00:00',
    })
    archiveAdminMock.mockResolvedValue(undefined)

    render(SuperAdminDashboardView)

    expect(await screen.findByText('Superadmin Dashboard')).toBeTruthy()
    expect(await screen.findByText('Create Organization Admin')).toBeTruthy()

    const textboxes = screen.getAllByRole('textbox')
    await fireEvent.update(textboxes[0], 'New Org')
    await fireEvent.update(textboxes[2], 'Bob')
    await fireEvent.update(textboxes[4], 'bob@example.com')
    await fireEvent.click(screen.getByRole('button', { name: 'Create org and invite admin' }))

    await waitFor(() => {
      expect(createAdminMock).toHaveBeenCalledWith({
        organizationName: 'New Org',
        organizationNumber: undefined,
        organizationType: 'RESTAURANT',
        firstName: 'Bob',
        lastName: undefined,
        email: 'bob@example.com',
      })
      expect(screen.getByText('Admin invite sent to bob@example.com.')).toBeTruthy()
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Archive' }))

    await waitFor(() => {
      expect(archiveAdminMock).toHaveBeenCalledWith(2)
    })
  })
})
