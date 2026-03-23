<script setup lang="ts">
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
}
</script>

<template>
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
}
</style>
