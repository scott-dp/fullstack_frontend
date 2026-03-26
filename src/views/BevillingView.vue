<script setup lang="ts">
/**
 * Bevilling (alcohol license) overview view showing the current active license,
 * its conditions, serving hours, and expiry warnings.
 */
import { ref, onMounted, computed } from 'vue'
import { bevillingApi, type Bevilling } from '@/api/bevilling'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
/** The current active bevilling, null if none. */
const bevilling = ref<Bevilling | null>(null)
/** Whether data is still loading. */
const loading = ref(true)
/** Error message if loading failed. */
const error = ref('')

/** Days until the license expires, or null if no expiry. */
const daysUntilExpiry = computed(() => {
  if (!bevilling.value?.validTo) return null
  const diff = new Date(bevilling.value.validTo).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

/** Whether the license is expiring within 90 days. */
const isExpiringSoon = computed(() => {
  return daysUntilExpiry.value !== null && daysUntilExpiry.value <= 90 && daysUntilExpiry.value > 0
})

/** Whether the license has expired. */
const isExpired = computed(() => {
  return daysUntilExpiry.value !== null && daysUntilExpiry.value <= 0
})

/** Ordered weekday labels for display. */
const weekdayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const weekdayLabels: Record<string, string> = {
  MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday',
  FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday'
}

/** Serving hours sorted by weekday. */
const sortedHours = computed(() => {
  if (!bevilling.value) return []
  return [...bevilling.value.servingHours].sort(
    (a, b) => weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday)
  )
})

/** Alcohol group labels. */
const groupLabels: Record<string, string> = {
  GROUP_1: 'Group 1 (up to 4.7%)',
  GROUP_2: 'Group 2 (4.7%-22%)',
  GROUP_3: 'Group 3 (above 22%)'
}

onMounted(async () => {
  try {
    bevilling.value = await bevillingApi.getCurrent()
  } catch {
    error.value = 'Failed to load bevilling information.'
  } finally {
    loading.value = false
  }
})

/**
 * Formats a bevilling type to a human-readable label.
 */
function formatType(t: string) {
  if (t === 'SKJENKING') return 'Skjenkebevilling (On-premises)'
  if (t === 'SALG') return 'Salgsbevilling (Off-premises)'
  return 'Combined License'
}

/**
 * Returns CSS class for a status badge.
 */
function statusClass(s: string) {
  if (s === 'ACTIVE') return 'success'
  if (s === 'SUSPENDED') return 'warning'
  return 'danger'
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Bevilling</h1>
      <div v-if="auth.hasManageAccess && bevilling" class="header-actions">
        <router-link :to="`/app/bevilling/${bevilling.id}/edit`" class="btn btn-secondary">Edit License</router-link>
        <router-link :to="`/app/bevilling/${bevilling.id}/conditions`" class="btn btn-secondary">Manage Conditions</router-link>
      </div>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="error" class="card">
      <div class="alert-error">{{ error }}</div>
    </div>

    <div v-else-if="!bevilling" class="empty-state">
      <h3>No active bevilling</h3>
      <p>No active alcohol license has been registered for your organization.</p>
      <router-link v-if="auth.hasManageAccess" to="/app/bevilling/new" class="btn btn-primary">Register License</router-link>
    </div>

    <template v-else>
      <!-- Expiry warnings -->
      <div v-if="isExpired" class="alert-error alert-banner">
        This license expired {{ Math.abs(daysUntilExpiry!) }} days ago. Please renew immediately.
      </div>
      <div v-else-if="isExpiringSoon" class="alert-warning alert-banner">
        This license expires in {{ daysUntilExpiry }} days. Consider starting the renewal process.
      </div>

      <!-- License details -->
      <div class="card">
        <div class="meta-row">
          <span class="status-badge" :class="statusClass(bevilling.status)">{{ bevilling.status }}</span>
          <span class="status-badge info">{{ formatType(bevilling.bevillingType) }}</span>
        </div>

        <div class="info-grid">
          <div><span class="info-label">Municipality</span><span>{{ bevilling.municipality }}</span></div>
          <div><span class="info-label">License Number</span><span>{{ bevilling.licenseNumber || '-' }}</span></div>
          <div><span class="info-label">Valid From</span><span>{{ bevilling.validFrom }}</span></div>
          <div><span class="info-label">Valid To</span><span>{{ bevilling.validTo || 'Indefinite' }}</span></div>
          <div><span class="info-label">Styrer</span><span>{{ bevilling.styrerName || '-' }}</span></div>
          <div><span class="info-label">Stedfortreder</span><span>{{ bevilling.stedfortrederName || '-' }}</span></div>
          <div><span class="info-label">Indoor</span><span>{{ bevilling.indoorAllowed ? 'Yes' : 'No' }}</span></div>
          <div><span class="info-label">Outdoor</span><span>{{ bevilling.outdoorAllowed ? 'Yes' : 'No' }}</span></div>
        </div>

        <div v-if="bevilling.servingAreaDescription" class="section">
          <h3>Serving Area</h3>
          <p>{{ bevilling.servingAreaDescription }}</p>
        </div>

        <div class="section">
          <h3>Alcohol Groups Allowed</h3>
          <div class="badge-row">
            <span v-for="g in bevilling.alcoholGroupsAllowed" :key="g" class="status-badge info">
              {{ groupLabels[g] || g }}
            </span>
          </div>
        </div>

        <div v-if="bevilling.notes" class="section">
          <h3>Notes</h3>
          <p class="notes-text">{{ bevilling.notes }}</p>
        </div>
      </div>

      <!-- Conditions -->
      <div class="card">
        <h2>Conditions ({{ bevilling.conditions.length }})</h2>
        <div v-if="bevilling.conditions.length === 0" class="text-muted text-sm">No conditions registered.</div>
        <div v-for="c in bevilling.conditions" :key="c.id" class="condition-item">
          <div class="condition-header">
            <strong>{{ c.title }}</strong>
            <span class="status-badge" :class="c.active ? 'success' : 'danger'">{{ c.active ? 'Active' : 'Inactive' }}</span>
          </div>
          <div class="condition-type">{{ c.conditionType.replace(/_/g, ' ') }}</div>
          <p v-if="c.description">{{ c.description }}</p>
        </div>
      </div>

      <!-- Serving Hours -->
      <div class="card">
        <h2>Serving Hours</h2>
        <div v-if="sortedHours.length === 0" class="text-muted text-sm">No serving hours configured.</div>
        <div v-else class="hours-grid">
          <div v-for="h in sortedHours" :key="h.id" class="hours-row">
            <span class="day-label">{{ weekdayLabels[h.weekday] || h.weekday }}</span>
            <span class="hours-time">{{ h.startTime }} - {{ h.endTime }}</span>
            <span class="hours-deadline">+{{ h.consumptionDeadlineMinutesAfterEnd }}min</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  gap: 8px;
}
.alert-error {
  padding: 10px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
  font-size: 14px;
}
.alert-warning {
  padding: 10px 14px;
  background: #fef3cd;
  color: #856404;
  border-radius: var(--radius);
  font-size: 14px;
}
.alert-banner {
  margin-bottom: 16px;
}
.meta-row {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.info-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text);
  margin-bottom: 2px;
}
.section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.section h3 {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text);
  margin-bottom: 8px;
}
.section p {
  color: var(--text-h);
  white-space: pre-wrap;
}
.badge-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.notes-text {
  white-space: pre-wrap;
}
h2 {
  margin-bottom: 16px;
}
.condition-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.condition-item:last-child {
  border-bottom: none;
}
.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.condition-type {
  font-size: 12px;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.condition-item p {
  color: var(--text-h);
  font-size: 14px;
}
.hours-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hours-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.hours-row:last-child {
  border-bottom: none;
}
.day-label {
  min-width: 100px;
  font-weight: 600;
  font-size: 14px;
}
.hours-time {
  font-size: 14px;
  color: var(--text-h);
}
.hours-deadline {
  font-size: 12px;
  color: var(--text);
}
</style>
