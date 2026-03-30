<!-- Deviation overview page with filtering across status and compliance category. -->
<script setup lang="ts">
/**
 * Deviations list view displaying all deviation reports in a filterable table.
 * Supports filtering by status and category. Rows are clickable to navigate
 * to the deviation detail page.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { deviationApi, type Deviation } from '@/api/operations/deviations.ts'

/** All deviation reports loaded from the server. */
const deviations = ref<Deviation[]>([])
/** Whether deviations are still being fetched. */
const loading = ref(true)
/** Currently selected status filter value, empty string for all. */
const statusFilter = ref('')
/** Currently selected category filter value, empty string for all. */
const categoryFilter = ref('')
const { t, locale } = useI18n()

/** Deviations filtered by the selected status and category. */
const filtered = computed(() => {
  return deviations.value.filter((d: Deviation) => {
    if (statusFilter.value && d.status !== statusFilter.value) return false
    if (categoryFilter.value && d.category !== categoryFilter.value) return false
    return true
  })
})

onMounted(async () => {
  try {
    deviations.value = await deviationApi.list()
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
 * @param s - Deviation status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
 * @returns CSS class name for the status badge
 */
function statusClass(s: string) {
  if (s === 'CLOSED' || s === 'RESOLVED') return 'success'
  if (s === 'IN_PROGRESS') return 'info'
  return 'warning'
}

/**
 * Formats an ISO-8601 timestamp to a locale-specific date string.
 * @param iso - ISO-8601 date string
 * @returns Formatted date string
 */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(locale.value)
}

function categoryLabel(category: string) {
  return category === 'FOOD' ? t('IK-Mat') : t('IK-Alkohol')
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

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    OPEN: t('Open'),
    IN_PROGRESS: t('In Progress'),
    RESOLVED: t('Resolved'),
    CLOSED: t('Closed'),
  }
  return labels[status] ?? status
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Deviations') }}</h1>
      <router-link to="/app/deviations/new" class="btn btn-primary">{{ t('Report Deviation') }}</router-link>
    </div>

    <div class="filter-bar">
      <select v-model="statusFilter" class="form-select">
        <option value="">{{ t('All Statuses') }}</option>
        <option value="OPEN">{{ t('Open') }}</option>
        <option value="IN_PROGRESS">{{ t('In Progress') }}</option>
        <option value="RESOLVED">{{ t('Resolved') }}</option>
        <option value="CLOSED">{{ t('Closed') }}</option>
      </select>
      <select v-model="categoryFilter" class="form-select">
        <option value="">{{ t('All Categories') }}</option>
        <option value="FOOD">{{ t('IK-Mat (Food)') }}</option>
        <option value="ALCOHOL">{{ t('IK-Alkohol') }}</option>
      </select>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <h3>{{ t('No deviations found') }}</h3>
      <p>{{ t('No deviations match your filters.') }}</p>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>{{ t('Title') }}</th>
            <th>{{ t('Category') }}</th>
            <th>{{ t('Severity') }}</th>
            <th>{{ t('Status') }}</th>
            <th>{{ t('Reported By') }}</th>
            <th>{{ t('Assigned To') }}</th>
            <th>{{ t('Date') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in filtered" :key="d.id" class="clickable-row" @click="$router.push(`/app/deviations/${d.id}`)">
            <td><strong>{{ d.title }}</strong></td>
            <td>{{ categoryLabel(d.category) }}</td>
            <td><span class="status-badge" :class="severityClass(d.severity)">{{ severityLabel(d.severity) }}</span></td>
            <td><span class="status-badge" :class="statusClass(d.status)">{{ statusLabel(d.status) }}</span></td>
            <td>{{ d.reportedByUsername }}</td>
            <td>{{ d.assignedToUsername || '-' }}</td>
            <td>{{ formatDate(d.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.clickable-row {
  cursor: pointer;
}
.clickable-row:hover td {
  background: var(--accent-bg);
}
</style>
