<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { authApi } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()
const loading = ref(true)
const success = ref('')
const error = ref('')

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''

  if (!token) {
    error.value = t('Verification token is missing')
    loading.value = false
    return
  }

  try {
    const response = await authApi.verifyEmail(token)
    success.value = response.message
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Email verification failed'),
      byStatus: {
        400: t('This verification link is invalid or has expired.'),
      },
    })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1>{{ t('Verify Email') }}</h1>
      <p class="text-muted">{{ t('Activate your account before signing in.') }}</p>

      <div v-if="loading" class="loading-state">{{ t('Verifying your email...') }}</div>
      <div v-else-if="success" class="alert-success">
        {{ success }}
      </div>
      <div v-else class="alert-error">
        {{ error }}
      </div>

      <p class="auth-footer">
        <router-link to="/login">{{ t('Go to login') }}</router-link>
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
