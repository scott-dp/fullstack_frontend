<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppShell from '../components/layout/AppShell.vue'
import { healthApi, type HealthResponse } from '../services/healthApi'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const health = ref<HealthResponse | null>(null)

onMounted(async () => {
  health.value = await healthApi.getStatus()
})
</script>

<template>
  <AppShell>
    <section class="dashboard-view">
      <article class="panel dashboard-view__hero">
        <p class="eyebrow">Authenticated area</p>
        <h2>{{ authStore.user?.username }}</h2>
        <p class="muted">
          This is the placeholder for your protected app shell, feature routes, and domain stores.
        </p>
      </article>

      <article class="panel dashboard-view__card">
        <h3>Backend status</h3>
        <p v-if="health">{{ health.application }}: {{ health.status }}</p>
        <p v-else class="muted">Loading backend health endpoint...</p>
      </article>

      <article class="panel dashboard-view__card">
        <h3>Roles</h3>
        <p class="muted">{{ authStore.user?.roles.join(', ') }}</p>
      </article>
    </section>
  </AppShell>
</template>

<style scoped>
.dashboard-view {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
}

.dashboard-view__hero,
.dashboard-view__card {
  padding: 1.5rem;
}

.dashboard-view__hero h2 {
  margin: 0.35rem 0 0.5rem;
  font-size: clamp(1.7rem, 4vw, 3rem);
}

.dashboard-view__card h3 {
  margin-top: 0;
}

@media (max-width: 768px) {
  .dashboard-view {
    grid-template-columns: 1fr;
  }
}
</style>
