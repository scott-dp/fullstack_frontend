<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { routineApi, type Routine } from '@/api/routines'
import { useAuthStore } from '@/stores/auth'

const routines = ref<Routine[]>([])
const loading = ref(true)
const moduleFilter = ref('')
const categoryFilter = ref('')
const activeFilter = ref('')
const auth = useAuthStore()

const filtered = computed(() => {
  return routines.value.filter((r: Routine) => {
    if (moduleFilter.value && r.moduleType !== moduleFilter.value) return false
    if (categoryFilter.value && r.category !== categoryFilter.value) return false
    if (activeFilter.value === 'true' && !r.active) return false
    if (activeFilter.value === 'false' && r.active) return false
    return true
  })
})

onMounted(async () => {
  try {
    routines.value = await routineApi.list()
  } finally {
    loading.value = false
  }
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

function moduleLabel(mt: string) {
  if (mt === 'IK_MAT') return 'IK-Mat'
  if (mt === 'IK_ALKOHOL') return 'IK-Alkohol'
  return 'Shared'
}

function frequencyLabel(f: string) {
  return f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    .replace('None', 'None')
}

function isOverdueForReview(r: Routine) {
  if (!r.reviewIntervalDays || !r.active) return false
  if (!r.lastReviewedAt) return true
  const lastReview = new Date(r.lastReviewedAt)
  const dueDate = new Date(lastReview.getTime() + r.reviewIntervalDays * 86400000)
  return dueDate < new Date()
}

const matCategories = ['HYGIENE', 'CLEANING', 'TEMPERATURE', 'TRACEABILITY', 'ALLERGENS', 'HACCP']
const alkoholCategories = ['AGE_CONTROL', 'INTOXICATION', 'CLOSING', 'BYO_CONTROL', 'LICENSE_CONDITIONS', 'SECURITY']
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Routines</h1>
      <router-link v-if="auth.hasManageAccess" to="/app/routines/new" class="btn btn-primary">New Routine</router-link>
    </div>

    <div class="filter-bar">
      <select v-model="moduleFilter" class="form-select">
        <option value="">All Modules</option>
        <option value="IK_MAT">IK-Mat (Food)</option>
        <option value="IK_ALKOHOL">IK-Alkohol</option>
        <option value="SHARED">Shared</option>
      </select>
      <select v-model="categoryFilter" class="form-select">
        <option value="">All Categories</option>
        <optgroup label="IK-Mat">
          <option v-for="c in matCategories" :key="c" :value="c">{{ c.replace(/_/g, ' ') }}</option>
        </optgroup>
        <optgroup label="IK-Alkohol">
          <option v-for="c in alkoholCategories" :key="c" :value="c">{{ c.replace(/_/g, ' ') }}</option>
        </optgroup>
        <option value="OTHER">Other</option>
      </select>
      <select v-model="activeFilter" class="form-select">
        <option value="">All Status</option>
        <option value="true">Active</option>
        <option value="false">Archived</option>
      </select>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <h3>No routines found</h3>
      <p>No routines match your filters.</p>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Module</th>
            <th>Category</th>
            <th>Frequency</th>
            <th>Responsible</th>
            <th>Status</th>
            <th>Last Review</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.id" class="clickable-row" @click="$router.push(`/app/routines/${r.id}`)">
            <td>
              <strong>{{ r.name }}</strong>
              <span v-if="isOverdueForReview(r)" class="status-badge danger" style="margin-left: 8px; font-size: 11px;">Review overdue</span>
            </td>
            <td>{{ moduleLabel(r.moduleType) }}</td>
            <td>{{ r.category.replace(/_/g, ' ') }}</td>
            <td>{{ frequencyLabel(r.frequencyType) }}</td>
            <td>{{ r.responsibleRole }}</td>
            <td>
              <span class="status-badge" :class="r.active ? 'success' : 'warning'">
                {{ r.active ? 'Active' : 'Archived' }}
              </span>
            </td>
            <td>{{ r.lastReviewedAt ? formatDate(r.lastReviewedAt) : 'Never' }}</td>
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
