import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  authApi,
  type CurrentUser,
  type EmailCodeLoginRequest,
  type EmailCodeRequest,
  type LoginRequest,
  type MessageResponse,
  type RegisterRequest,
  type RegistrationResponse,
} from '@/api/auth'

/**
 * Authentication store managing the current user session.
 * Persists user state across route navigations and provides
 * role-based access helpers.
 */
export const useAuthStore = defineStore('auth', () => {
  /** Currently authenticated user, or null when logged out. */
  const user = ref<CurrentUser | null>(null)

  /** Whether an auth operation (login/register/logout) is in progress. */
  const loading = ref(false)

  /** Whether the current session has an authenticated user. */
  const isAuthenticated = computed(() => user.value !== null)

  /** Whether the current user holds the ADMIN role. */
  const isAdmin = computed(() => user.value?.roles.includes('ROLE_ADMIN') ?? false)

  /** Whether the current user holds the SUPERADMIN role. */
  const isSuperAdmin = computed(() => user.value?.roles.includes('ROLE_SUPERADMIN') ?? false)

  /** Whether the current user holds the MANAGER role. */
  const isManager = computed(() => user.value?.roles.includes('ROLE_MANAGER') ?? false)

  /** Whether the current user is an admin or manager (has elevated access). */
  const hasManageAccess = computed(() => isAdmin.value || isManager.value)

  /** Organization ID of the current user, or undefined. */
  const organizationId = computed(() => user.value?.organizationId)

  /**
   * Checks the current session status with the server.
   * Updates the user ref if authenticated, clears it otherwise.
   */
  async function checkAuth() {
    try {
      const res = await authApi.status()
      user.value = res.authenticated ? res.user : null
    } catch {
      user.value = null
    }
  }

  /**
   * Authenticates the user with the provided credentials.
   * On success the user ref is updated and the auth cookie is set by the server.
   * @param data - Username and password payload
   * @throws {HttpError} When credentials are invalid
   */
  async function login(data: LoginRequest) {
    loading.value = true
    try {
      const res = await authApi.login(data)
      user.value = res.user
    } finally {
      loading.value = false
    }
  }

  /**
   * Registers a new user account and automatically logs them in.
   * @param data - Username and password payload
   * @throws {HttpError} When registration fails (e.g. duplicate username)
   */
  async function register(data: RegisterRequest): Promise<RegistrationResponse> {
    loading.value = true
    try {
      return await authApi.register(data)
    } finally {
      loading.value = false
    }
  }

  /**
   * Logs out the current user.
   * Calls the server to invalidate the session and clears local state.
   */
  async function logout() {
    await authApi.logout()
    user.value = null
  }

  async function requestEmailCode(data: EmailCodeRequest): Promise<MessageResponse> {
    loading.value = true
    try {
      return await authApi.requestEmailCode(data)
    } finally {
      loading.value = false
    }
  }

  async function loginWithEmailCode(data: EmailCodeLoginRequest) {
    loading.value = true
    try {
      const res = await authApi.loginWithEmailCode(data)
      user.value = res.user
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isManager,
    hasManageAccess,
    organizationId,
    checkAuth,
    login,
    register,
    logout,
    requestEmailCode,
    loginWithEmailCode,
  }
})
