<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { trainingApi, type TrainingReport } from '@/api/operations/trainings.ts'

const report = ref<TrainingReport | null>(null)
const loading = ref(true)
const { t } = useI18n()

onMounted(async () => {
  try {
    report.value = await trainingApi.report()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Training Report') }}</h1>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else-if="report">
      <div class="stats-grid">
        <div class="stat-card card">
          <span class="stat-label">{{ t('Templates') }}</span>
          <span class="stat-value">{{ report.totalTemplates }}</span>
          <span class="stat-desc">{{ t('Active training templates') }}</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">{{ t('Total Assignments') }}</span>
          <span class="stat-value">{{ report.totalAssignments }}</span>
          <span class="stat-desc">{{ t('All time') }}</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">{{ t('Completed') }}</span>
          <span class="stat-value success">{{ report.completedCount }}</span>
          <span class="stat-desc">{{ t('Training completed') }}</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">{{ t('Overdue') }}</span>
          <span class="stat-value" :class="report.overdueCount > 0 ? 'danger' : ''">{{ report.overdueCount }}</span>
          <span class="stat-desc">{{ t('Needing attention') }}</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">{{ t('Completion Rate') }}</span>
          <span class="stat-value info">{{ Math.round(report.completionRate) }}%</span>
          <span class="stat-desc">{{ t('Overall') }}</span>
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
.stat-value.danger { color: var(--danger); }
.stat-value.info { color: var(--accent); }
.stat-desc {
  font-size: 13px;
  color: var(--text);
}
</style>
