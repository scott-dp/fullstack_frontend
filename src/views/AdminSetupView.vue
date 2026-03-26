<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi, type AdminSetupInfo } from '@/api/auth'
import { HttpError } from '@/api/client'

const route = useRoute()
const router = useRouter()

const token = computed(() => String(route.query.token || ''))
const loading = ref(true)
const saving = ref(false)
const info = ref<AdminSetupInfo | null>(null)
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')

onMounted(async () => {
  if (!token.value) {
    error.value = 'Setup token is missing'
    loading.value = false
    return
  }

  try {
    info.value = await authApi.getAdminSetupInfo(token.value)
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to load setup invitation'
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  saving.value = true
  try {
    const response = await authApi.completeAdminSetup({ token: token.value, password: password.value })
    success.value = response.message
    setTimeout(() => router.push({ name: 'login' }), 1200)
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to complete account setup'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1>Set Up Admin Account</h1>
      <div v-if="loading" class="loading"><div class="spinner" /></div>
      <template v-else>
        <div v-if="error" class="alert-error">{{ error }}</div>
        <div v-if="success" class="alert-success">{{ success }}</div>
        <template v-if="info">
          <p class="text-muted">
            {{ [info.firstName, info.lastName].filter(Boolean).join(' ') || info.email }} for {{ info.organizationName }}
          </p>
          <form class="auth-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input :value="info.email" class="form-input" type="email" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input v-model="password" class="form-input" type="password" required minlength="8" autocomplete="new-password" />
            </div>
            <div class="form-group">
              <label class="form-label">Confirm password</label>
              <input v-model="confirmPassword" class="form-input" type="password" required minlength="8" autocomplete="new-password" />
            </div>
            <button type="submit" class="btn btn-primary btn-full" :disabled="saving">
              {{ saving ? 'Saving...' : 'Activate account' }}
            </button>
          </form>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-secondary);
}
.auth-card {
  width: 100%;
  max-width: 420px;
}
.auth-form {
  margin-top: 20px;
}
.btn-full {
  width: 100%;
  margin-top: 8px;
}
.alert-error {
  padding: 10px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 16px;
}
.alert-success {
  padding: 10px 14px;
  background: var(--success-bg);
  color: var(--success);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 16px;
}
</style>
