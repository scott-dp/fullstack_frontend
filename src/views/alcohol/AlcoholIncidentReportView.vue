<!-- Summary reporting page showing alcohol incident trends and type breakdowns. -->
<script setup lang="ts">
/**
 * Alcohol Incident report view showing summary statistics for all
 * alcohol-related incidents in the current organization.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { alcoholIncidentApi, type IncidentReport } from '@/api/operations/alcoholIncidents.ts'

/** The loaded incident report, null until fetched. */
const report = ref<IncidentReport | null>(null)
/** Whether the report is still being loaded. */
const loading = ref(true)
/** Error message if loading failed. */
const error = ref('')
const { t } = useI18n()

/** Under-review count derived from totals. */
const underReviewCount = computed(() => {
  if (!report.value) return 0
  return report.value.totalIncidents - report.value.openCount - report.value.closedCount
})

/** Sorted type entries for display. */
const sortedTypes = computed(() => {
  if (!report.value) return []
  return Object.entries(report.value.byType)
    .sort((a, b) => b[1] - a[1])
})

onMounted(async () => {
  try {
    report.value = await alcoholIncidentApi.report()
  } catch {
    error.value = t('Failed to load report. You may not have access.')
  } finally {
    loading.value = false
  }
})

/**
 * Formats an incident type enum to a human-readable label.
 * @param t - Incident type enum
 * @returns Formatted label
 */
function formatType(t: string) {
  return t.replace(/_/g, ' ')
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Incident Report') }}</h1>
      <router-link to="/app/alcohol-incidents" class="btn btn-secondary">{{ t('Back') }}</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="error" class="card">
      <div class="alert-error">{{ error }}</div>
    </div>

    <template v-else-if="report">
      <div class="stats-grid">
        <div class="card stat-card">
          <div class="stat-value">{{ report.totalIncidents }}</div>
          <div class="stat-label">{{ t('Total Incidents') }}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value warning-text">{{ report.openCount }}</div>
          <div class="stat-label">{{ t('Open') }}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value info-text">{{ underReviewCount }}</div>
          <div class="stat-label">{{ t('Under Review') }}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value success-text">{{ report.closedCount }}</div>
          <div class="stat-label">{{ t('Closed') }}</div>
        </div>
      </div>

      <div class="card">
        <h2>{{ t('Incidents by Type') }}</h2>
        <div v-if="sortedTypes.length === 0" class="text-muted text-sm">{{ t('No incidents recorded yet.') }}</div>
        <div v-else class="type-list">
          <div v-for="[typeName, count] in sortedTypes" :key="typeName" class="type-row">
            <span class="type-name">{{ t(formatType(typeName)) }}</span>
            <div class="type-bar-wrapper">
              <div class="type-bar" :style="{ width: (count / report!.totalIncidents * 100) + '%' }" />
            </div>
            <span class="type-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.stat-card {
  text-align: center;
  padding: 20px;
}
.stat-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 6px;
}
.stat-label {
  font-size: 13px;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.warning-text { color: var(--warning, #e67e22); }
.info-text { color: var(--accent, #3498db); }
.success-text { color: var(--success, #27ae60); }
.alert-error {
  padding: 10px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
  font-size: 14px;
}
h2 {
  margin-bottom: 16px;
}
.type-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.type-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.type-name {
  min-width: 200px;
  font-size: 14px;
  text-transform: capitalize;
}
.type-bar-wrapper {
  flex: 1;
  height: 20px;
  background: var(--accent-bg, #f0f0f0);
  border-radius: var(--radius, 4px);
  overflow: hidden;
}
.type-bar {
  height: 100%;
  background: var(--accent, #3498db);
  border-radius: var(--radius, 4px);
  min-width: 4px;
  transition: width 0.3s ease;
}
.type-count {
  min-width: 32px;
  text-align: right;
  font-weight: 600;
  font-size: 14px;
}
</style>
