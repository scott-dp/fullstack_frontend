<script setup lang="ts">
/**
 * Admin dashboard providing system-wide management and overview.
 * Shows organization stats, quick links to admin functions,
 * and system health information.
 */
import { ref, onMounted } from 'vue'
import { dashboardApi, type DashboardData } from '@/api/dashboard'
import { userApi, type UserSummary } from '@/api/users'

/** Dashboard stats data. */
const stats = ref<DashboardData | null>(null)
/** Users in the organization. */
const users = ref<UserSummary[]>([])
/** Whether data is loading. */
const loading = ref(true)

onMounted(async () => {
  try {
    const [s, u] = await Promise.all([
      dashboardApi.get(),
      userApi.list(),
    ])
    stats.value = s
    users.value = u
  } finally {
    loading.value = false
  }
})

/** Count users by role. */
function countByRole(role: string): number {
  return users.value.filter((u: UserSummary) => u.roles.includes(role)).length
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Admin Dashboard</h1>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else>
      <!-- System overview -->
      <div class="stats-grid">
        <div class="stat-card card">
          <span class="stat-label">Total Users</span>
          <span class="stat-value">{{ users.length }}</span>
          <span class="stat-desc">In organization</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">Admins</span>
          <span class="stat-value info">{{ countByRole('ROLE_ADMIN') }}</span>
          <span class="stat-desc">System administrators</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">Managers</span>
          <span class="stat-value info">{{ countByRole('ROLE_MANAGER') }}</span>
          <span class="stat-desc">Compliance managers</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">Staff</span>
          <span class="stat-value">{{ countByRole('ROLE_STAFF') }}</span>
          <span class="stat-desc">Operational staff</span>
        </div>
      </div>

      <template v-if="stats">
        <h2>Compliance Overview</h2>
        <div class="stats-grid">
          <div class="stat-card card">
            <span class="stat-label">Active Templates</span>
            <span class="stat-value">{{ stats.totalChecklistTemplates }}</span>
            <span class="stat-desc">Checklist templates</span>
          </div>
          <div class="stat-card card">
            <span class="stat-label">Completed Today</span>
            <span class="stat-value success">{{ stats.checklistsCompletedToday }}</span>
            <span class="stat-desc">Checklists finished</span>
          </div>
          <div class="stat-card card">
            <span class="stat-label">Temp Alerts</span>
            <span class="stat-value" :class="stats.temperatureAlertsToday > 0 ? 'danger' : ''">{{ stats.temperatureAlertsToday }}</span>
            <span class="stat-desc">Today</span>
          </div>
          <div class="stat-card card">
            <span class="stat-label">Open Deviations</span>
            <span class="stat-value" :class="stats.openDeviations > 0 ? 'warning' : ''">{{ stats.openDeviations + stats.inProgressDeviations }}</span>
            <span class="stat-desc">Needing attention</span>
          </div>
        </div>
      </template>

      <!-- Admin quick actions -->
      <h2>Administration</h2>
      <div class="admin-grid">
        <router-link to="/app/admin/users" class="action-card card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
          </div>
          <div>
            <h3>User Management</h3>
            <p class="text-muted text-sm">View and manage user accounts and roles</p>
          </div>
        </router-link>
        <router-link to="/app/checklists" class="action-card card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <div>
            <h3>Checklist Templates</h3>
            <p class="text-muted text-sm">Create and manage compliance checklists</p>
          </div>
        </router-link>
        <router-link to="/app/deviations" class="action-card card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <div>
            <h3>Deviations</h3>
            <p class="text-muted text-sm">Review and assign open deviations</p>
          </div>
        </router-link>
        <router-link to="/app/checklists/history" class="action-card card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h3>Audit History</h3>
            <p class="text-muted text-sm">View checklist completion history</p>
          </div>
        </router-link>
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
h2 {
  margin-top: 8px;
  margin-bottom: 16px;
}
.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}
.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.action-card:hover {
  box-shadow: var(--shadow);
  border-color: var(--accent-border);
  text-decoration: none;
}
.action-card h3 {
  margin-bottom: 2px;
}
.action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--accent-bg);
  color: var(--accent);
  flex-shrink: 0;
}
</style>
