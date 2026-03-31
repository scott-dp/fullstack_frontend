<!-- Overview page for the active alcohol license, serving hours, and renewal status. -->
<script setup lang="ts">
/**
 * Bevilling (alcohol license) overview view showing the current active license,
 * its conditions, serving hours, and expiry warnings.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { bevillingApi, type Bevilling } from '@/api/operations/bevilling.ts'
import { useAuthStore } from '@/stores/auth.ts'

const auth = useAuthStore()
const { t, locale } = useI18n()
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
/** Serving hours sorted by weekday. */
const sortedHours = computed(() => {
  if (!bevilling.value) return []
  return [...bevilling.value.servingHours].sort(
    (a, b) => weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday)
  )
})

/** Alcohol group labels. */
onMounted(async () => {
  try {
    bevilling.value = await bevillingApi.getCurrent()
  } catch {
    error.value = t('Failed to load bevilling information.')
  } finally {
    loading.value = false
  }
})

/**
 * Formats a bevilling type to a human-readable label.
 */
function formatType(type: string) {
  if (type === 'SKJENKING') return t('On-premises License')
  if (type === 'SALG') return t('Off-premises License')
  return t('Combined License')
}

/**
 * Returns CSS class for a status badge.
 */
function statusClass(s: string) {
  if (s === 'ACTIVE') return 'success'
  if (s === 'SUSPENDED') return 'warning'
  return 'danger'
}

function weekdayLabel(day: string) {
  const labels: Record<string, string> = {
    MON: t('Monday'),
    TUE: t('Tuesday'),
    WED: t('Wednesday'),
    THU: t('Thursday'),
    FRI: t('Friday'),
    SAT: t('Saturday'),
    SUN: t('Sunday'),
  }
  return labels[day] ?? day
}

function groupLabel(group: string) {
  const labels: Record<string, string> = {
    GROUP_1: t('Group 1 (up to 4.7%)'),
    GROUP_2: t('Group 2 (4.7%-22%)'),
    GROUP_3: t('Group 3 (above 22%)'),
  }
  return labels[group] ?? group
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(locale.value)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Bevilling') }}</h1>
      <div v-if="auth.hasManageAccess && bevilling" class="header-actions">
        <router-link :to="`/app/bevilling/${bevilling.id}/edit`" class="btn btn-secondary">{{ t('Edit License') }}</router-link>
        <router-link :to="`/app/bevilling/${bevilling.id}/conditions`" class="btn btn-secondary">{{ t('Manage Conditions') }}</router-link>
      </div>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="error" class="card">
      <div class="alert-error">{{ error }}</div>
    </div>

    <div v-else-if="!bevilling" class="empty-state">
      <h3>{{ t('No active bevilling') }}</h3>
      <p>{{ t('No active alcohol license has been registered for your organization.') }}</p>
      <router-link v-if="auth.hasManageAccess" to="/app/bevilling/new" class="btn btn-primary">{{ t('Register License') }}</router-link>
    </div>

    <template v-else>
      <!-- Expiry warnings -->
      <div v-if="isExpired" class="alert-error alert-banner">
        {{ t('This license expired {days} days ago. Please renew immediately.', { days: Math.abs(daysUntilExpiry!) }) }}
      </div>
      <div v-else-if="isExpiringSoon" class="alert-warning alert-banner">
        {{ t('This license expires in {days} days. Consider starting the renewal process.', { days: daysUntilExpiry }) }}
      </div>

      <!-- License details -->
      <div class="card">
        <div class="meta-row">
          <span class="status-badge" :class="statusClass(bevilling.status)">{{ t(bevilling.status.charAt(0) + bevilling.status.slice(1).toLowerCase()) }}</span>
          <span class="status-badge info">{{ formatType(bevilling.bevillingType) }}</span>
        </div>

        <div class="info-grid">
          <div><span class="info-label">{{ t('Municipality') }}</span><span>{{ bevilling.municipality }}</span></div>
          <div><span class="info-label">{{ t('License Number') }}</span><span>{{ bevilling.licenseNumber || '-' }}</span></div>
          <div><span class="info-label">{{ t('Valid From') }}</span><span>{{ formatDate(bevilling.validFrom) }}</span></div>
          <div><span class="info-label">{{ t('Valid To') }}</span><span>{{ bevilling.validTo ? formatDate(bevilling.validTo) : t('Indefinite') }}</span></div>
          <div><span class="info-label">{{ t('License Manager') }}</span><span>{{ bevilling.styrerName || '-' }}</span></div>
          <div><span class="info-label">{{ t('Deputy') }}</span><span>{{ bevilling.stedfortrederName || '-' }}</span></div>
          <div><span class="info-label">{{ t('Indoor') }}</span><span>{{ bevilling.indoorAllowed ? t('Yes') : t('No') }}</span></div>
          <div><span class="info-label">{{ t('Outdoor') }}</span><span>{{ bevilling.outdoorAllowed ? t('Yes') : t('No') }}</span></div>
        </div>

        <div v-if="bevilling.servingAreaDescription" class="section">
          <h3>{{ t('Serving Area') }}</h3>
          <p>{{ bevilling.servingAreaDescription }}</p>
        </div>

        <div class="section">
          <h3>{{ t('Alcohol Groups Allowed') }}</h3>
          <div class="badge-row">
            <span v-for="g in bevilling.alcoholGroupsAllowed" :key="g" class="status-badge info">
              {{ groupLabel(g) }}
            </span>
          </div>
        </div>

        <div v-if="bevilling.notes" class="section">
          <h3>{{ t('Notes') }}</h3>
          <p class="notes-text">{{ bevilling.notes }}</p>
        </div>
      </div>

      <!-- Conditions -->
      <div class="card">
        <h2>{{ t('Conditions') }} ({{ bevilling.conditions.length }})</h2>
        <div v-if="bevilling.conditions.length === 0" class="text-muted text-sm">{{ t('No conditions registered.') }}</div>
        <div v-for="c in bevilling.conditions" :key="c.id" class="condition-item">
          <div class="condition-header">
            <strong>{{ c.title }}</strong>
            <span class="status-badge" :class="c.active ? 'success' : 'danger'">{{ c.active ? t('Active') : t('Inactive') }}</span>
          </div>
          <div class="condition-type">{{ t(c.conditionType.replace(/_/g, ' ')) }}</div>
          <p v-if="c.description">{{ c.description }}</p>
        </div>
      </div>

      <!-- Serving Hours -->
      <div class="card">
        <h2>{{ t('Serving Hours') }}</h2>
        <div v-if="sortedHours.length === 0" class="text-muted text-sm">{{ t('No serving hours configured.') }}</div>
        <div v-else class="hours-grid">
          <div v-for="h in sortedHours" :key="h.id" class="hours-row">
            <span class="day-label">{{ weekdayLabel(h.weekday) }}</span>
            <span class="hours-time">{{ h.startTime }} - {{ h.endTime }}</span>
            <span class="hours-deadline">+{{ h.consumptionDeadlineMinutesAfterEnd }} {{ t('min') }}</span>
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
