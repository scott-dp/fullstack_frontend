<!-- Routine library view for browsing active and archived operational procedures. -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { routineApi, type Routine } from '@/api/operations/routines.ts'
import { useAuthStore } from '@/stores/auth.ts'

const routines = ref<Routine[]>([])
const loading = ref(true)
const moduleFilter = ref('')
const categoryFilter = ref('')
const activeFilter = ref('')
const auth = useAuthStore()
const { t, locale } = useI18n()

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
  return new Date(iso).toLocaleDateString(locale.value)
}

function moduleLabel(mt: string) {
  if (mt === 'IK_MAT') return t('IK-Mat')
  if (mt === 'IK_ALKOHOL') return t('IK-Alkohol')
  return t('Shared')
}

function frequencyLabel(f: string) {
  const labels: Record<string, string> = {
    NONE: t('None'),
    DAILY: t('Daily'),
    WEEKLY: t('Weekly'),
    MONTHLY: t('Monthly'),
    SHIFT_BASED: t('Shift-Based'),
    EVENT_BASED: t('Event-Based'),
  }
  return labels[f] ?? f.replace(/_/g, ' ')
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    HYGIENE: t('Hygiene'),
    CLEANING: t('Cleaning'),
    TEMPERATURE: t('Temperature'),
    TRACEABILITY: t('Traceability'),
    ALLERGENS: t('Allergens'),
    HACCP: t('HACCP'),
    AGE_CONTROL: t('Age Control'),
    INTOXICATION: t('Intoxication'),
    CLOSING: t('Closing'),
    BYO_CONTROL: t('BYO Control'),
    LICENSE_CONDITIONS: t('License Conditions'),
    SECURITY: t('Security'),
    OTHER: t('Other'),
  }
  return labels[category] ?? category.replace(/_/g, ' ')
}

function responsibleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: t('Admin'),
    MANAGER: t('Manager'),
    STAFF: t('Staff'),
    ALL: t('All'),
  }
  return labels[role] ?? role
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
      <h1>{{ t('Routines') }}</h1>
      <router-link v-if="auth.hasManageAccess" to="/app/routines/new" class="btn btn-primary">{{ t('New Routine') }}</router-link>
    </div>

    <div class="filter-bar">
      <select v-model="moduleFilter" class="form-select">
        <option value="">{{ t('All Modules') }}</option>
        <option value="IK_MAT">{{ t('IK-Mat (Food)') }}</option>
        <option value="IK_ALKOHOL">{{ t('IK-Alkohol') }}</option>
        <option value="SHARED">{{ t('Shared') }}</option>
      </select>
      <select v-model="categoryFilter" class="form-select">
        <option value="">{{ t('All Categories') }}</option>
        <optgroup :label="t('IK-Mat')">
          <option v-for="c in matCategories" :key="c" :value="c">{{ categoryLabel(c) }}</option>
        </optgroup>
        <optgroup :label="t('IK-Alkohol')">
          <option v-for="c in alkoholCategories" :key="c" :value="c">{{ categoryLabel(c) }}</option>
        </optgroup>
        <option value="OTHER">{{ t('Other') }}</option>
      </select>
      <select v-model="activeFilter" class="form-select">
        <option value="">{{ t('All Status') }}</option>
        <option value="true">{{ t('Active') }}</option>
        <option value="false">{{ t('Archived') }}</option>
      </select>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <h3>{{ t('No routines found') }}</h3>
      <p>{{ t('No routines match your filters.') }}</p>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>{{ t('Name') }}</th>
            <th>{{ t('Module') }}</th>
            <th>{{ t('Category') }}</th>
            <th>{{ t('Frequency') }}</th>
            <th>{{ t('Responsible') }}</th>
            <th>{{ t('Status') }}</th>
            <th>{{ t('Last Review') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.id" class="clickable-row" @click="$router.push(`/app/routines/${r.id}`)">
            <td>
              <strong>{{ r.name }}</strong>
              <span v-if="isOverdueForReview(r)" class="status-badge danger" style="margin-left: 8px; font-size: 11px;">{{ t('Review overdue') }}</span>
            </td>
            <td>{{ moduleLabel(r.moduleType) }}</td>
            <td>{{ categoryLabel(r.category) }}</td>
            <td>{{ frequencyLabel(r.frequencyType) }}</td>
            <td>{{ responsibleLabel(r.responsibleRole) }}</td>
            <td>
              <span class="status-badge" :class="r.active ? 'success' : 'warning'">
                {{ r.active ? t('Active') : t('Archived') }}
              </span>
            </td>
            <td>{{ r.lastReviewedAt ? formatDate(r.lastReviewedAt) : t('Never') }}</td>
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
