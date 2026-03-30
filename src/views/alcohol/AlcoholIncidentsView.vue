<script setup lang="ts">
/**
 * Alcohol Incidents list view displaying all incident reports in a filterable table.
 * Supports filtering by status and incident type. Rows are clickable to navigate
 * to the incident detail page.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { alcoholIncidentApi, type AlcoholIncident } from '@/api/operations/alcoholIncidents.ts'

/** All incident reports loaded from the server. */
const incidents = ref<AlcoholIncident[]>([])
/** Whether incidents are still being fetched. */
const loading = ref(true)
/** Currently selected status filter value, empty string for all. */
const statusFilter = ref('')
/** Currently selected type filter value, empty string for all. */
const typeFilter = ref('')
const { t, locale } = useI18n()

/** Incidents filtered by the selected status and type. */
const filtered = computed(() => {
  return incidents.value.filter((i: AlcoholIncident) => {
    if (statusFilter.value && i.status !== statusFilter.value) return false
    if (typeFilter.value && i.incidentType !== typeFilter.value) return false
    return true
  })
})

onMounted(async () => {
  try {
    incidents.value = await alcoholIncidentApi.list()
  } finally {
    loading.value = false
  }
})

/**
 * Determines the CSS class for a severity badge.
 * @param s - Severity level (LOW, MEDIUM, HIGH, CRITICAL)
 * @returns CSS class name for the severity badge
 */
function severityClass(s: string) {
  if (s === 'CRITICAL' || s === 'HIGH') return 'danger'
  if (s === 'MEDIUM') return 'warning'
  return 'info'
}

/**
 * Determines the CSS class for a status badge.
 * @param s - Incident status (OPEN, UNDER_REVIEW, CLOSED)
 * @returns CSS class name for the status badge
 */
function statusClass(s: string) {
  if (s === 'CLOSED') return 'success'
  if (s === 'UNDER_REVIEW') return 'info'
  return 'warning'
}

/**
 * Formats an incident type enum value to a human-readable label.
 * @param t - Incident type enum value
 * @returns Formatted label
 */
function formatType(t: string) {
  return t.replace(/_/g, ' ')
}

/**
 * Formats an ISO-8601 timestamp to a locale-specific date string.
 * @param iso - ISO-8601 date string
 * @returns Formatted date string
 */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(locale.value)
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    OPEN: t('Open'),
    UNDER_REVIEW: t('Under Review'),
    CLOSED: t('Closed'),
  }
  return labels[status] ?? status
}

function severityLabel(severity: string) {
  const labels: Record<string, string> = {
    LOW: t('Low'),
    MEDIUM: t('Medium'),
    HIGH: t('High'),
    CRITICAL: t('Critical'),
  }
  return labels[severity] ?? severity
}

function followUpLabel(value: boolean) {
  return value ? t('Yes') : t('No')
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Alcohol Incidents') }}</h1>
      <div class="header-actions">
        <router-link to="/app/alcohol-incidents/report" class="btn btn-secondary">{{ t('View Report') }}</router-link>
        <router-link to="/app/alcohol-incidents/new" class="btn btn-primary">{{ t('Report Incident') }}</router-link>
      </div>
    </div>

    <div class="filter-bar">
      <select v-model="statusFilter" class="form-select">
        <option value="">{{ t('All Statuses') }}</option>
        <option value="OPEN">{{ t('Open') }}</option>
        <option value="UNDER_REVIEW">{{ t('Under Review') }}</option>
        <option value="CLOSED">{{ t('Closed') }}</option>
      </select>
      <select v-model="typeFilter" class="form-select">
        <option value="">{{ t('All Types') }}</option>
        <option value="AGE_DOUBT_REFUSAL">{{ t('Age Doubt Refusal') }}</option>
        <option value="UNDERAGE_ATTEMPT">{{ t('Underage Attempt') }}</option>
        <option value="INTOXICATION_REFUSAL">{{ t('Intoxication Refusal') }}</option>
        <option value="GUEST_REMOVED">{{ t('Guest Removed') }}</option>
        <option value="SUSPECTED_FAKE_ID">{{ t('Suspected Fake ID') }}</option>
        <option value="BROUGHT_IN_ALCOHOL">{{ t('Brought In Alcohol') }}</option>
        <option value="ALCOHOL_TAKEN_OUTSIDE_LICENSED_AREA">{{ t('Outside Licensed Area') }}</option>
        <option value="SERVICE_AFTER_CLOSING_RISK">{{ t('Service After Closing Risk') }}</option>
        <option value="OTHER">{{ t('Other') }}</option>
      </select>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <h3>{{ t('No incidents found') }}</h3>
      <p>{{ t('No alcohol incidents match your filters.') }}</p>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>{{ t('Type') }}</th>
            <th>{{ t('Severity') }}</th>
            <th>{{ t('Status') }}</th>
            <th>{{ t('Location') }}</th>
            <th>{{ t('Reported By') }}</th>
            <th>{{ t('Occurred') }}</th>
            <th>{{ t('Follow-up') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in filtered" :key="i.id" class="clickable-row" @click="$router.push(`/app/alcohol-incidents/${i.id}`)">
            <td><strong>{{ t(formatType(i.incidentType)) }}</strong></td>
            <td><span class="status-badge" :class="severityClass(i.severity)">{{ severityLabel(i.severity) }}</span></td>
            <td><span class="status-badge" :class="statusClass(i.status)">{{ statusLabel(i.status) }}</span></td>
            <td>{{ i.locationArea || '-' }}</td>
            <td>{{ i.reportedByUsername }}</td>
            <td>{{ formatDate(i.occurredAt) }}</td>
            <td>{{ followUpLabel(i.followUpRequired) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  gap: 8px;
}
.clickable-row {
  cursor: pointer;
}
.clickable-row:hover td {
  background: var(--accent-bg);
}
</style>
