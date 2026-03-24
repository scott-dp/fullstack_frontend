<script setup lang="ts">
<<<<<<< HEAD
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({
  username: '',
  password: '',
})

const submit = async () => {
  await authStore.login(form)

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
  await router.push(redirect)
=======
/**
 * Login view presenting a username/password form.
 * Authenticates via the auth store and redirects to the originally
 * requested page (or dashboard) on success.
 */
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { HttpError } from '@/api/client'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

/** Bound username input value. */
const username = ref('')
/** Bound password input value. */
const password = ref('')
/** Error message displayed on authentication failure. */
const error = ref('')

/**
 * Handles form submission by attempting login.
 * On success redirects to the originally requested route or dashboard.
 * On failure displays the error message from the server.
 */
async function handleSubmit() {
  error.value = ''
  try {
    await auth.login({ username: username.value, password: password.value })
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Login failed'
  }
>>>>>>> 248622a611a643656dfd1dc7d8b8d839c05f5368
}
</script>

<template>
<<<<<<< HEAD
  <AppShell>
    <section class="panel login-view">
      <div>
        <p class="eyebrow">Cookie auth</p>
        <h2>Connect this form to your real auth flow when the backend model is ready.</h2>
      </div>

      <form class="login-view__form" @submit.prevent="submit">
        <label class="field">
          <span>Username</span>
          <input v-model="form.username" autocomplete="username" required />
        </label>

        <label class="field">
          <span>Password</span>
          <input v-model="form.password" autocomplete="current-password" required type="password" />
        </label>

        <p v-if="authStore.errorMessage" class="error">{{ authStore.errorMessage }}</p>

        <div class="login-view__actions">
          <button class="button" :disabled="authStore.loading" type="submit">
            {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </section>
  </AppShell>
</template>

<style scoped>
.login-view {
  padding: 2rem;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.5rem;
}

.login-view h2 {
  margin: 0.5rem 0 0;
  font-size: clamp(1.6rem, 3vw, 2.6rem);
  max-width: 16ch;
}

.login-view__form {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.62);
}

.login-view__actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .login-view {
    grid-template-columns: 1fr;
  }
=======
  <div class="auth-page">
    <div class="auth-card card">
      <h1>Sign In</h1>
      <p class="text-muted">IK System - Internal Control</p>
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="alert-error">{{ error }}</div>
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-input"
            required
            autocomplete="username"
            autofocus
          />
        </div>
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
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
          {{ auth.loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      <p class="auth-footer">
        Don't have an account? <router-link to="/register">Register</router-link>
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
>>>>>>> 248622a611a643656dfd1dc7d8b8d839c05f5368
}
</style>
