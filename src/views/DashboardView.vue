<script setup lang="ts">
<<<<<<< HEAD
import { onMounted, ref } from 'vue'
import AppShell from '../components/layout/AppShell.vue'
import { healthApi, type HealthResponse } from '../services/healthApi'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const health = ref<HealthResponse | null>(null)

onMounted(async () => {
  health.value = await healthApi.getStatus()
=======
/**
 * Dashboard view displaying compliance statistics and quick action cards.
 * Fetches aggregated data from the dashboard API on mount.
 */
import { ref, onMounted } from 'vue'
import { dashboardApi, type DashboardData } from '@/api/dashboard'

/** Aggregated dashboard statistics, null until loaded. */
const data = ref<DashboardData | null>(null)
/** Whether the dashboard data is still being fetched. */
const loading = ref(true)

onMounted(async () => {
  try {
    data.value = await dashboardApi.get()
  } finally {
    loading.value = false
  }
>>>>>>> 248622a611a643656dfd1dc7d8b8d839c05f5368
})
</script>

<template>
<<<<<<< HEAD
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
=======
  <div>
    <div class="page-header">
      <h1>Dashboard</h1>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else-if="data">
      <div class="stats-grid">
        <div class="stat-card card">
          <span class="stat-label">Checklist Templates</span>
          <span class="stat-value">{{ data.totalChecklistTemplates }}</span>
          <span class="stat-desc">Active templates</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">Completed Today</span>
          <span class="stat-value success">{{ data.checklistsCompletedToday }}</span>
          <span class="stat-desc">Checklists finished</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">Temperature Alerts</span>
          <span class="stat-value" :class="data.temperatureAlertsToday > 0 ? 'danger' : ''">{{ data.temperatureAlertsToday }}</span>
          <span class="stat-desc">Alerts today</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">Open Deviations</span>
          <span class="stat-value" :class="data.openDeviations > 0 ? 'warning' : ''">{{ data.openDeviations }}</span>
          <span class="stat-desc">Needing attention</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">In Progress</span>
          <span class="stat-value info">{{ data.inProgressDeviations }}</span>
          <span class="stat-desc">Being resolved</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">Notifications</span>
          <span class="stat-value">{{ data.unreadNotifications }}</span>
          <span class="stat-desc">Unread</span>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <router-link to="/checklists" class="action-card card">
            <h3>Complete Checklist</h3>
            <p class="text-muted text-sm">Complete a daily, weekly, or monthly checklist</p>
          </router-link>
          <router-link to="/temperature" class="action-card card">
            <h3>Log Temperature</h3>
            <p class="text-muted text-sm">Record storage temperature readings</p>
          </router-link>
          <router-link to="/deviations/new" class="action-card card">
            <h3>Report Deviation</h3>
            <p class="text-muted text-sm">Report a non-compliance issue</p>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-h);
  line-height: 1.2;
}
.stat-value.success { color: var(--success); }
.stat-value.warning { color: var(--warning); }
.stat-value.danger { color: var(--danger); }
.stat-value.info { color: var(--accent); }
.stat-desc {
  font-size: 13px;
  color: var(--text);
}
.quick-actions {
  margin-top: 8px;
}
.quick-actions h2 {
  margin-bottom: 16px;
}
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.action-card {
  text-decoration: none;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.action-card:hover {
  box-shadow: var(--shadow);
  border-color: var(--accent-border);
  text-decoration: none;
}
.action-card h3 {
  margin-bottom: 4px;
>>>>>>> 248622a611a643656dfd1dc7d8b8d839c05f5368
}
</style>
