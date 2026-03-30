import { describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/client', () => ({
  request: requestMock,
}))

describe('organizationInviteApi', () => {
  it('lists invites', async () => {
    const { organizationInviteApi } = await import('../../src/api/auth/organizationInvites')

    organizationInviteApi.list()

    expect(requestMock).toHaveBeenCalledWith('/organization-invites')
  })

  it('creates invites', async () => {
    const { organizationInviteApi } = await import('../../src/api/auth/organizationInvites')

    organizationInviteApi.create({ role: 'ROLE_MANAGER', organizationId: 2, expiresInDays: 7 })

    expect(requestMock).toHaveBeenCalledWith('/organization-invites', {
      method: 'POST',
      body: JSON.stringify({ role: 'ROLE_MANAGER', organizationId: 2, expiresInDays: 7 }),
    })
  })

  it('accepts invites', async () => {
    const { organizationInviteApi } = await import('../../src/api/auth/organizationInvites')

    organizationInviteApi.accept({ token: 'abc' })

    expect(requestMock).toHaveBeenCalledWith('/organization-invites/accept', {
      method: 'POST',
      body: JSON.stringify({ token: 'abc' }),
    })
  })
})
