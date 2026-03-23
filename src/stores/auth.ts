import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '../services/authApi'
import { ApiError } from '../services/httpClient'
import type { AuthRequest, CurrentUser } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  const initialized = ref(false)
  const loading = ref(false)
  const user = ref<CurrentUser | null>(null)
  const errorMessage = ref('')

  const isAuthenticated = computed(() => user.value !== null)

  const initialize = async () => {
    if (initialized.value) {
      return
    }

    try {
      const response = await authApi.getAuthStatus()
      user.value = response.user
    } catch {
      user.value = null
    } finally {
      initialized.value = true
    }
  }

  const login = async (payload: AuthRequest) => {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await authApi.login(payload)
      user.value = response.user
    } catch (error) {
      errorMessage.value = error instanceof ApiError ? error.message : 'Unable to log in'
      throw error
    } finally {
      loading.value = false
    }
  }

  const register = async (payload: AuthRequest) => {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await authApi.register(payload)
      user.value = response.user
    } catch (error) {
      errorMessage.value = error instanceof ApiError ? error.message : 'Unable to register'
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true

    try {
      await authApi.logout()
    } finally {
      user.value = null
      loading.value = false
    }
  }

  return {
    errorMessage,
    initialized,
    isAuthenticated,
    loading,
    user,
    initialize,
    login,
    logout,
    register,
  }
})
