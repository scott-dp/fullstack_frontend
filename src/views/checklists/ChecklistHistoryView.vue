<script setup lang="ts">
/**
 * Checklist history view showing a table of all past checklist completions.
 * Fetches completions from the API on mount.
 */
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { checklistApi, type ChecklistCompletion } from '@/api/operations/checklists.ts'

/** All checklist completions loaded from the server. */
const completions = ref<ChecklistCompletion[]>([])
/** Whether completions are still being fetched. */
const loading = ref(true)
const { t, locale } = useI18n()

onMounted(async () => {
  try {
    completions.value = await checklistApi.listCompletions()
  } finally {
    loading.value = false
  }
})

/**
 * Determines the CSS class for a completion status badge.
 * @param status - Completion status (COMPLETE, DEVIATION_FOUND, etc.)
 * @returns CSS class name for the status badge
 */
function statusClass(status: string) {
  if (status === 'COMPLETE') return 'success'
  if (status === 'DEVIATION_FOUND') return 'danger'
  return 'warning'
}

/**
 * Formats an ISO-8601 timestamp to a locale-specific date/time string.
 * @param iso - ISO-8601 date string
 * @returns Formatted date/time string
 */
function formatDate(iso: string) {
  return new Date(iso).toLocaleString(locale.value)
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    COMPLETE: t('Complete'),
    DEVIATION_FOUND: t('Deviation Found'),
    INCOMPLETE: t('Incomplete'),
  }
  return labels[status] ?? status
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Checklist History') }}</h1>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="completions.length === 0" class="empty-state">
      <h3>{{ t('No completions yet') }}</h3>
      <p>{{ t('Complete your first checklist to see it here.') }}</p>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>{{ t('Checklist') }}</th>
            <th>{{ t('Completed By') }}</th>
            <th>{{ t('Date') }}</th>
            <th>{{ t('Status') }}</th>
            <th>{{ t('Comment') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in completions" :key="c.id">
            <td>{{ c.templateTitle }}</td>
            <td>{{ c.completedByUsername }}</td>
            <td>{{ formatDate(c.completedAt) }}</td>
            <td><span class="status-badge" :class="statusClass(c.status)">{{ statusLabel(c.status) }}</span></td>
            <td>{{ c.comment || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
