<script setup lang="ts">
/**
 * Registration view presenting a sign-up form with password confirmation.
 * Registers via the auth store and redirects to the dashboard on success.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { HttpError } from '@/api/client'

const router = useRouter()
const auth = useAuthStore()

/** Bound username input value. */
const username = ref('')
/** Bound password input value. */
const password = ref('')
/** Bound password confirmation input value. */
const confirmPassword = ref('')
/** Error message displayed on registration failure. */
const error = ref('')

/**
 * Handles form submission by validating password match and attempting registration.
 * On success redirects to the dashboard. On failure displays the error message.
 */
async function handleSubmit() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  try {
    await auth.register({ username: username.value, password: password.value })
    router.push('/')
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Registration failed'
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1>Register</h1>
      <p class="text-muted">Create your account</p>
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="alert-error">{{ error }}</div>
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input id="username" v-model="username" type="text" class="form-input" required minlength="3" maxlength="50" autocomplete="username" autofocus />
        </div>
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input id="password" v-model="password" type="password" class="form-input" required minlength="6" autocomplete="new-password" />
        </div>
        <div class="form-group">
          <label for="confirm-password" class="form-label">Confirm Password</label>
          <input id="confirm-password" v-model="confirmPassword" type="password" class="form-input" required minlength="6" autocomplete="new-password" />
        </div>
        <button type="submit" class="btn btn-primary btn-full" :disabled="auth.loading">
          {{ auth.loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>
      <p class="auth-footer">
        Already have an account? <router-link to="/login">Sign in</router-link>
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
.auth-footer {
  margin-top: 20px;
  font-size: 14px;
}
</style>
