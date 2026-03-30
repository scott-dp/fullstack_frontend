<script setup lang="ts">
/**
 * Registration view presenting a sign-up form with password confirmation.
 * Registers via the auth store and redirects to the dashboard on success.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/api/client'
import PasswordInput from '@/components/PasswordInput.vue'

const auth = useAuthStore()
const { t } = useI18n()

/** Bound username input value. */
const username = ref('')
/** Bound email input value. */
const email = ref('')
/** Bound password input value. */
const password = ref('')
/** Bound password confirmation input value. */
const confirmPassword = ref('')
/** Error message displayed on registration failure. */
const error = ref('')
/** Success message shown after registration. */
const success = ref('')

/**
 * Handles form submission by validating password match and attempting registration.
 * On success redirects to the dashboard. On failure displays the error message.
 */
async function handleSubmit() {
  error.value = ''
  success.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = t('Passwords do not match')
    return
  }
  try {
    const response = await auth.register({
      username: username.value,
      email: email.value,
      password: password.value,
    })
    success.value = response.message
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Registration failed'),
      byStatus: {
        400: t('Could not create account. Check your details or try a different username or email.'),
      },
    })
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1>{{ t('Register') }}</h1>
      <p class="text-muted">{{ t('Create your account.') }}</p>
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="success" class="alert-success">
          <p>{{ success }}</p>
        </div>
        <div v-if="error" class="alert-error">{{ error }}</div>
        <div class="form-group">
          <label for="username" class="form-label">{{ t('Username') }}</label>
          <input id="username" v-model="username" type="text" class="form-input" required minlength="3" maxlength="50" autocomplete="username" autofocus />
        </div>
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input id="email" v-model="email" type="email" class="form-input" required maxlength="255" autocomplete="email" />
        </div>
        <PasswordInput
          id="password"
          v-model="password"
          :label="t('Password')"
          autocomplete="new-password"
          :minlength="6"
          required
        />
        <PasswordInput
          id="confirm-password"
          v-model="confirmPassword"
          :label="t('Confirm Password')"
          autocomplete="new-password"
          :minlength="6"
          required
        />
        <button type="submit" class="btn btn-primary btn-full" :disabled="auth.loading">
          {{ auth.loading ? t('Creating account...') : t('Register') }}
        </button>
      </form>
      <p class="auth-footer">
        {{ t('Already have an account?') }} <router-link to="/login">{{ t('Sign In') }}</router-link>
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
.alert-success {
  padding: 10px 14px;
  background: var(--success-bg);
  color: var(--success);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 16px;
}
.btn-full {
  width: 100%;
  margin-top: 8px;
}
.auth-footer {
  margin-top: 20px;
  font-size: 14px;
}
</style>
