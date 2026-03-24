import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type CurrentUser, type AuthRequest } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<CurrentUser | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.roles.includes('ROLE_ADMIN') ?? false)
  const isManager = computed(() => user.value?.roles.includes('ROLE_MANAGER') ?? false)
  const hasManageAccess = computed(() => isAdmin.value || isManager.value)
  const organizationId = computed(() => user.value?.organizationId)

  async function checkAuth() {
    try {
      const res = await authApi.status()
      user.value = res.authenticated ? res.user : null
    } catch {
      user.value = null
    }
  }

  async function login(data: AuthRequest) {
    loading.value = true
    try {
      const res = await authApi.login(data)
      user.value = res.user
    } finally {
      loading.value = false
    }
  }

  async function register(data: AuthRequest) {
    loading.value = true
    try {
      const res = await authApi.register(data)
      user.value = res.user
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authApi.logout()
    user.value = null
  }

  return { user, loading, isAuthenticated, isAdmin, isManager, hasManageAccess, organizationId, checkAuth, login, register, logout }
})
