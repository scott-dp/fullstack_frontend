<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { HttpError } from '@/api/client'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')

async function handleSubmit() {
  error.value = ''
  try {
    await auth.login({ username: username.value, password: password.value })
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Login failed'
  }
}
</script>

<template>
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
}
</style>
