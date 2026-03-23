<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const title = computed(() => {
  if (route.name === 'dashboard') {
    return 'Workspace'
  }

  if (route.name === 'login') {
    return 'Authentication'
  }

  return 'Project Starter'
})

const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'home' })
}
</script>

<template>
  <div class="shell">
    <header class="panel app-shell__header">
      <div>
        <p class="eyebrow">Vue + Spring starter</p>
        <h1>{{ title }}</h1>
      </div>

      <nav class="app-shell__nav">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink v-if="!authStore.isAuthenticated" to="/login">Login</RouterLink>
        <RouterLink v-else to="/dashboard">Dashboard</RouterLink>
        <button
          v-if="authStore.isAuthenticated"
          class="button secondary"
          type="button"
          @click="signOut"
        >
          Logout
        </button>
      </nav>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-shell__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 1.5rem 1.75rem;
  margin-bottom: 1.25rem;
}

.app-shell__header h1 {
  margin: 0.25rem 0 0;
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 0.96;
}

.app-shell__nav {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.app-shell__nav a {
  color: #1f4d57;
  font-weight: 600;
}

@media (max-width: 768px) {
  .app-shell__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .app-shell__nav {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
