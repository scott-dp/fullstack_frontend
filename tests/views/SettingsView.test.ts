/**
 * View tests for settings/profile updates.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import SettingsView from '../../src/views/SettingsView.vue'

const {
  updateProfileMock,
  authStoreMock,
} = vi.hoisted(() => ({
  updateProfileMock: vi.fn(),
  authStoreMock: {
    user: {
      username: 'mia',
      firstName: 'Mia',
      lastName: 'Admin',
      email: 'mia@example.com',
      roles: ['ROLE_ADMIN'],
    },
  },
}))

vi.mock('@/api/auth/users.ts', () => ({
  userApi: {
    updateProfile: updateProfileMock,
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('SettingsView', () => {
  beforeEach(() => {
    updateProfileMock.mockReset()
    authStoreMock.user = {
      username: 'mia',
      firstName: 'Mia',
      lastName: 'Admin',
      email: 'mia@example.com',
      roles: ['ROLE_ADMIN'],
    }
  })

  it('updates the user profile and shows success', async () => {
    updateProfileMock.mockResolvedValue({
      username: 'mia',
      firstName: 'Mia',
      lastName: 'Manager',
      email: 'mia@example.com',
      roles: ['ROLE_ADMIN'],
    })

    render(SettingsView, {
      global: { plugins: [i18n] },
    })

    await screen.findByDisplayValue('Mia')
    await fireEvent.update(screen.getByDisplayValue('Admin'), 'Manager')
    await fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith({
        firstName: 'Mia',
        lastName: 'Manager',
        email: 'mia@example.com',
      })
      expect(screen.getByText('Profile updated successfully')).toBeTruthy()
    })
  })
})
