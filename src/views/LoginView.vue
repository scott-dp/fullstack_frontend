<script setup lang="ts">
/**
 * Login view presenting an email-or-username/password form.
 * Authenticates via the auth store and redirects to the originally
 * requested page (or dashboard) on success.
 */
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { HttpError } from '@/api/client'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { t } = useI18n()

/** Bound username/email input value. */
const identifier = ref('')
/** Bound password input value. */
const password = ref('')
/** Bound email input value for code-based login. */
const emailForCode = ref('')
/** Bound one-time code value. */
const emailCode = ref('')
/** Error message displayed on authentication failure. */
const error = ref('')
/** Status message for code delivery. */
const codeMessage = ref('')
/** Error message for code flow. */
const codeError = ref('')

/**
 * Handles form submission by attempting login.
 * On success redirects to the originally requested route or dashboard.
 * On failure displays the error message from the server.
 */
async function handleSubmit() {
  error.value = ''
  try {
    await auth.login({ identifier: identifier.value, password: password.value })
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : t('Login failed')
  }
}

async function requestCode() {
  codeError.value = ''
  codeMessage.value = ''
  try {
    const response = await auth.requestEmailCode({ email: emailForCode.value })
    codeMessage.value = response.message
  } catch (err: unknown) {
    codeError.value = err instanceof HttpError ? err.message : 'Failed to send login code'
  }
}

async function handleEmailCodeLogin() {
  codeError.value = ''
  try {
    await auth.loginWithEmailCode({ email: emailForCode.value, code: emailCode.value })
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (err: unknown) {
    codeError.value = err instanceof HttpError ? err.message : 'Email code login failed'
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1>{{ t('Sign In') }}</h1>
      <p class="text-muted">{{ t('IK System - Internal Control') }}</p>
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="alert-error">{{ error }}</div>
        <div class="form-group">
          <label for="identifier" class="form-label">Email or username</label>
          <input
            id="identifier"
            v-model="identifier"
            type="text"
            class="form-input"
            required
            autocomplete="username email"
            autofocus
          />
        </div>
        <div class="form-group">
          <label for="password" class="form-label">{{ t('Password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            required
            autocomplete="current-password"
          />
        </div>
        <button type="submit" class="btn btn-primary btn-full" :disabled="auth.loading">
          {{ auth.loading ? t('Signing in...') : t('Sign In') }}
        </button>
      </form>
      <div class="auth-divider"><span>or</span></div>
      <form @submit.prevent="handleEmailCodeLogin" class="auth-form code-form">
        <div v-if="codeMessage" class="alert-success">{{ codeMessage }}</div>
        <div v-if="codeError" class="alert-error">{{ codeError }}</div>
        <div class="form-group">
          <label for="email-code-email" class="form-label">Email</label>
          <input
            id="email-code-email"
            v-model="emailForCode"
            type="email"
            class="form-input"
            required
            autocomplete="email"
          />
        </div>
        <button type="button" class="btn btn-secondary btn-full" :disabled="auth.loading || !emailForCode" @click="requestCode">
          Send login code
        </button>
        <div class="form-group">
          <label for="email-code" class="form-label">Login code</label>
          <input
            id="email-code"
            v-model="emailCode"
            type="text"
            name="one-time-code"
            inputmode="numeric"
            maxlength="6"
            class="form-input"
            placeholder="6-digit code"
            autocomplete="one-time-code"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
          />
        </div>
        <button type="submit" class="btn btn-primary btn-full" :disabled="auth.loading || !emailForCode || !emailCode">
          Sign in with email code
        </button>
      </form>
      <p class="auth-footer">
        {{ t("Don't have an account?") }} <router-link to="/register">{{ t('Register') }}</router-link>
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
  max-width: 400px;
  text-align: center;
}
.auth-card h1 {
  margin-bottom: 4px;
}
.auth-form {
  margin-top: 24px;
  text-align: left;
}
.alert-error {
  padding: 10px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 16px;
}
.btn-full {
  width: 100%;
  margin-top: 8px;
}
.alert-success {
  padding: 10px 14px;
  background: var(--success-bg);
  color: var(--success);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 16px;
}
.auth-divider {
  margin: 24px 0 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text);
  font-size: 13px;
  text-transform: uppercase;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  height: 1px;
  flex: 1;
  background: var(--border);
}
.code-form {
  margin-top: 0;
}
.auth-footer {
  margin-top: 20px;
  font-size: 14px;
}
</style>
