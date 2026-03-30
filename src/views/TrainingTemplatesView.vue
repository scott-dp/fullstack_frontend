<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { trainingApi, type TrainingTemplate } from '@/api/trainings'
import { useAuthStore } from '@/stores/auth'

const templates = ref<TrainingTemplate[]>([])
const loading = ref(true)
const moduleFilter = ref('')
const auth = useAuthStore()
const { t } = useI18n()

const filtered = computed(() => {
  return templates.value.filter((template: TrainingTemplate) => {
    if (moduleFilter.value && template.moduleType !== moduleFilter.value) return false
    return true
  })
})

onMounted(async () => {
  try {
    templates.value = await trainingApi.listTemplates()
  } finally {
    loading.value = false
  }
})

function moduleLabel(mt: string) {
  if (mt === 'IK_MAT') return t('IK-Mat')
  if (mt === 'IK_ALKOHOL') return t('IK-Alkohol')
  return t('Shared')
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    ALL: t('All Staff'),
    ADMIN: t('Admin'),
    MANAGER: t('Manager'),
    STAFF: t('Staff'),
  }
  return labels[role] ?? role
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Training Templates') }}</h1>
      <router-link v-if="auth.hasManageAccess" to="/app/training/new" class="btn btn-primary">{{ t('New Template') }}</router-link>
    </div>

    <div class="filter-bar">
      <select v-model="moduleFilter" class="form-select">
        <option value="">{{ t('All Modules') }}</option>
        <option value="IK_MAT">{{ t('IK-Mat (Food)') }}</option>
        <option value="IK_ALKOHOL">{{ t('IK-Alkohol') }}</option>
        <option value="SHARED">{{ t('Shared') }}</option>
      </select>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <h3>{{ t('No training templates found') }}</h3>
      <p>{{ t('Create your first training template to get started.') }}</p>
    </div>

    <div v-else class="templates-grid">
      <div v-for="template in filtered" :key="template.id" class="card template-card" @click="$router.push(`/app/training/templates/${template.id}`)">
        <div class="template-header">
          <h3>{{ template.title }}</h3>
          <div class="template-badges">
            <span class="status-badge info">{{ moduleLabel(template.moduleType) }}</span>
            <span v-if="template.isMandatory" class="status-badge danger">{{ t('Mandatory') }}</span>
            <span class="status-badge" :class="template.active ? 'success' : 'warning'">{{ template.active ? t('Active') : t('Inactive') }}</span>
          </div>
        </div>
        <p v-if="template.description" class="text-muted text-sm">{{ template.description }}</p>
        <div class="template-meta">
          <span>{{ template.category.replace(/_/g, ' ') }}</span>
          <span>{{ roleLabel(template.requiredForRole) }}</span>
          <span v-if="template.validityDays">{{ t('Valid for {days} days', { days: template.validityDays }) }}</span>
          <span v-if="template.acknowledgmentRequired">{{ t('Acknowledgment required') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.template-card {
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.template-card:hover {
  box-shadow: var(--shadow);
  border-color: var(--accent-border);
}
.template-header {
  margin-bottom: 8px;
}
.template-header h3 {
  margin-bottom: 6px;
}
.template-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.template-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text);
  margin-top: 8px;
}
</style>
