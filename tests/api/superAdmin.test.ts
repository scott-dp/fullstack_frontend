import { describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/client', () => ({
  request: requestMock,
}))

describe('superAdminApi', () => {
  it('uses the expected superadmin endpoints', async () => {
    const { superAdminApi } = await import('../../src/api/admin/superAdmin')

    const payload = {
      organizationName: 'North Peak Bistro',
      organizationNumber: '123456789',
      organizationType: 'RESTAURANT',
      firstName: 'Ava',
      lastName: 'Nilsen',
      email: 'ava@example.com',
    }

    superAdminApi.listOrganizationAdmins()
    superAdminApi.createOrganizationAdmin(payload)
    superAdminApi.archiveOrganizationAdmin(5)

    expect(requestMock).toHaveBeenNthCalledWith(1, '/superadmin/organization-admins')
    expect(requestMock).toHaveBeenNthCalledWith(
      2,
      '/superadmin/organization-admins',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      '/superadmin/organization-admins/5',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
