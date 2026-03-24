<script setup lang="ts">
/**
 * Deviations list view displaying all deviation reports in a filterable table.
 * Supports filtering by status and category. Rows are clickable to navigate
 * to the deviation detail page.
 */
import { ref, onMounted, computed } from 'vue'
import { deviationApi, type Deviation } from '@/api/deviations'

/** All deviation reports loaded from the server. */
const deviations = ref<Deviation[]>([])
/** Whether deviations are still being fetched. */
const loading = ref(true)
/** Currently selected status filter value, empty string for all. */
const statusFilter = ref('')
/** Currently selected category filter value, empty string for all. */
const categoryFilter = ref('')

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
  return new Date(iso).toLocaleDateString()
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Deviations</h1>
      <router-link to="/app/deviations/new" class="btn btn-primary">Report Deviation</router-link>
    </div>

    <div class="filter-bar">
      <select v-model="statusFilter" class="form-select">
        <option value="">All Statuses</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
      </select>
      <select v-model="categoryFilter" class="form-select">
        <option value="">All Categories</option>
        <option value="FOOD">IK-Mat (Food)</option>
        <option value="ALCOHOL">IK-Alkohol</option>
      </select>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <h3>No deviations found</h3>
      <p>No deviations match your filters.</p>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Reported By</th>
            <th>Assigned To</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in filtered" :key="d.id" class="clickable-row" @click="$router.push(`/app/deviations/${d.id}`)">
            <td><strong>{{ d.title }}</strong></td>
            <td>{{ d.category === 'FOOD' ? 'IK-Mat' : 'IK-Alkohol' }}</td>
            <td><span class="status-badge" :class="severityClass(d.severity)">{{ d.severity }}</span></td>
            <td><span class="status-badge" :class="statusClass(d.status)">{{ d.status.replace('_', ' ') }}</span></td>
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
