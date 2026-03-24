<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { authApi } from '@/api/auth'
import { HttpError } from '@/api/client'

const route = useRoute()
const loading = ref(true)
const success = ref('')
const error = ref('')

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''

  if (!token) {
    error.value = 'Verification token is missing'
    loading.value = false
    return
  }

  try {
    const response = await authApi.verifyEmail(token)
    success.value = response.message
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Email verification failed'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1>Verify Email</h1>
      <p class="text-muted">Activate your account before signing in.</p>

      <div v-if="loading" class="loading-state">Verifying your email...</div>
      <div v-else-if="success" class="alert-success">
        {{ success }}
      </div>
      <div v-else class="alert-error">
        {{ error }}
      </div>

      <p class="auth-footer">
        <router-link to="/login">Go to login</router-link>
      </p>
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
  max-width: 440px;
  text-align: center;
}
.loading-state {
  margin-top: 24px;
  color: var(--text);
}
.alert-success {
  padding: 12px 14px;
  background: var(--success-bg);
  color: var(--success);
  border-radius: var(--radius);
  font-size: 14px;
  margin-top: 24px;
}
.alert-error {
  padding: 12px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
  font-size: 14px;
  margin-top: 24px;
}
.auth-footer {
  margin-top: 20px;
  font-size: 14px;
}
</style>
