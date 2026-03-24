<script setup lang="ts">
/**
 * Dashboard view displaying compliance statistics and quick action cards.
 * Fetches aggregated data from the dashboard API on mount.
 */
import { ref, onMounted } from 'vue'
import { dashboardApi, type DashboardData } from '@/api/dashboard'
import { organizationInviteApi } from '@/api/organizationInvites'
import { useAuthStore } from '@/stores/auth'
import { HttpError } from '@/api/client'

/** Aggregated dashboard statistics, null until loaded. */
const data = ref<DashboardData | null>(null)
/** Whether the dashboard data is still being fetched. */
const loading = ref(true)
const auth = useAuthStore()
const inviteToken = ref('')
const joining = ref(false)
const joinError = ref('')
const joinSuccess = ref('')

onMounted(async () => {
  try {
    data.value = await dashboardApi.get()
  } finally {
    loading.value = false
  }
})

async function acceptInvite() {
  joinError.value = ''
  joinSuccess.value = ''
  joining.value = true

  try {
    const updatedUser = await organizationInviteApi.accept({ token: inviteToken.value.trim() })
    auth.user = updatedUser
    data.value = await dashboardApi.get()
    inviteToken.value = ''
    joinSuccess.value = 'Invitation accepted. Your organization dashboard is now ready.'
  } catch (err: unknown) {
    joinError.value = err instanceof HttpError ? err.message : 'Failed to accept invitation'
  } finally {
    joining.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Dashboard</h1>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else-if="data && !data.organizationAssigned">
      <div class="card onboarding-card">
        <h2>No organization assigned yet</h2>
        <p class="text-muted">
          {{ data.message || 'You need an invitation from an admin or restaurant manager before you can access restaurant data.' }}
        </p>
        <form class="invite-form" @submit.prevent="acceptInvite">
          <div class="form-group">
            <label class="form-label" for="invite-token">Invitation token</label>
            <input
              id="invite-token"
              v-model="inviteToken"
              class="form-input"
              placeholder="Paste invite token here"
              :disabled="joining"
            />
          </div>
          <div v-if="joinSuccess" class="alert-success">{{ joinSuccess }}</div>
          <div v-if="joinError" class="alert-error">{{ joinError }}</div>
          <button type="submit" class="btn btn-primary" :disabled="joining || !inviteToken.trim()">
            {{ joining ? 'Joining organization...' : 'Join organization' }}
          </button>
        </form>
      </div>
    </template>

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
          <router-link to="/app/checklists" class="action-card card">
            <h3>Complete Checklist</h3>
            <p class="text-muted text-sm">Complete a daily, weekly, or monthly checklist</p>
          </router-link>
          <router-link to="/app/temperature" class="action-card card">
            <h3>Log Temperature</h3>
            <p class="text-muted text-sm">Record storage temperature readings</p>
          </router-link>
          <router-link to="/app/deviations/new" class="action-card card">
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
.onboarding-card {
  max-width: 720px;
}
.invite-form {
  margin-top: 20px;
}
.alert-success {
  padding: 10px 14px;
  background: var(--success-bg);
  color: var(--success);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 16px;
}
.alert-error {
  padding: 10px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 16px;
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
}
</style>
