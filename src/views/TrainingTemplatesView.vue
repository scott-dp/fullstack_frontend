<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { trainingApi, type TrainingTemplate } from '@/api/trainings'
import { useAuthStore } from '@/stores/auth'

const templates = ref<TrainingTemplate[]>([])
const loading = ref(true)
const moduleFilter = ref('')
const auth = useAuthStore()

const filtered = computed(() => {
  return templates.value.filter((t: TrainingTemplate) => {
    if (moduleFilter.value && t.moduleType !== moduleFilter.value) return false
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
  if (mt === 'IK_MAT') return 'IK-Mat'
  if (mt === 'IK_ALKOHOL') return 'IK-Alkohol'
  return 'Shared'
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Training Templates</h1>
      <router-link v-if="auth.hasManageAccess" to="/app/training/new" class="btn btn-primary">New Template</router-link>
    </div>

    <div class="filter-bar">
      <select v-model="moduleFilter" class="form-select">
        <option value="">All Modules</option>
        <option value="IK_MAT">IK-Mat (Food)</option>
        <option value="IK_ALKOHOL">IK-Alkohol</option>
        <option value="SHARED">Shared</option>
      </select>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <h3>No training templates found</h3>
      <p>Create your first training template to get started.</p>
    </div>

    <div v-else class="templates-grid">
      <div v-for="t in filtered" :key="t.id" class="card template-card" @click="$router.push(`/app/training/templates/${t.id}`)">
        <div class="template-header">
          <h3>{{ t.title }}</h3>
          <div class="template-badges">
            <span class="status-badge info">{{ moduleLabel(t.moduleType) }}</span>
            <span v-if="t.isMandatory" class="status-badge danger">Mandatory</span>
            <span class="status-badge" :class="t.active ? 'success' : 'warning'">{{ t.active ? 'Active' : 'Inactive' }}</span>
          </div>
        </div>
        <p v-if="t.description" class="text-muted text-sm">{{ t.description }}</p>
        <div class="template-meta">
          <span>{{ t.category.replace(/_/g, ' ') }}</span>
          <span v-if="t.validityDays">Valid for {{ t.validityDays }} days</span>
          <span v-if="t.acknowledgmentRequired">Acknowledgment required</span>
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
