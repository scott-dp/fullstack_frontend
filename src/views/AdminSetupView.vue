<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi, type AdminSetupInfo } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

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
    error.value = t('Setup token is missing')
    loading.value = false
    return
  }

  try {
    info.value = await authApi.getAdminSetupInfo(token.value)
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to load setup invitation'),
      byStatus: {
        400: t('This setup link is invalid or has expired. Ask for a new admin invitation.'),
      },
    })
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (password.value.length < 8) {
    error.value = t('Password must be at least 8 characters')
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = t('Passwords do not match')
    return
  }

  saving.value = true
  try {
    const response = await authApi.completeAdminSetup({ token: token.value, password: password.value })
    success.value = response.message
    setTimeout(() => router.push({ name: 'login' }), 1200)
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to complete account setup'),
      byStatus: {
        400: t('This setup link is invalid or has expired. Ask for a new admin invitation.'),
      },
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1>{{ t('Set Up Admin Account') }}</h1>
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
              <label class="form-label">{{ t('Email') }}</label>
              <input :value="info.email" class="form-input" type="email" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('Password') }}</label>
              <input v-model="password" class="form-input" type="password" required minlength="8" autocomplete="new-password" />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('Confirm Password') }}</label>
              <input v-model="confirmPassword" class="form-input" type="password" required minlength="8" autocomplete="new-password" />
            </div>
            <button type="submit" class="btn btn-primary btn-full" :disabled="saving">
              {{ saving ? t('Saving...') : t('Activate account') }}
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
