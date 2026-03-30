<!-- Supplier register for filtering and reviewing approved or inactive suppliers. -->
<script setup lang="ts">
/**
 * Suppliers list view displaying all suppliers in a filterable table.
 * Supports filtering by active/inactive status. Rows are clickable to
 * navigate to the supplier detail page. Managers can create new suppliers.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.ts'
import { supplierApi, type Supplier } from '@/api/operations/suppliers.ts'

const auth = useAuthStore()

/** All suppliers loaded from the server. */
const suppliers = ref<Supplier[]>([])
/** Whether suppliers are still being fetched. */
const loading = ref(true)
/** Active status filter: '' = all, 'true' = active, 'false' = inactive. */
const activeFilter = ref('')
const { t, locale } = useI18n()

/** Suppliers filtered by the selected active status. */
const filtered = computed(() => {
  return suppliers.value.filter((s: Supplier) => {
    if (activeFilter.value === 'true' && !s.active) return false
    if (activeFilter.value === 'false' && s.active) return false
    return true
  })
})

onMounted(async () => {
  try {
    suppliers.value = await supplierApi.list()
  } finally {
    loading.value = false
  }
})

/**
 * Formats an ISO-8601 timestamp to a locale-specific date string.
 * @param iso - ISO-8601 date string
 * @returns Formatted date string
 */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(locale.value)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Suppliers') }}</h1>
      <router-link v-if="auth.hasManageAccess" to="/app/suppliers/new" class="btn btn-primary">{{ t('New Supplier') }}</router-link>
    </div>

    <div class="filter-bar">
      <select v-model="activeFilter" class="form-select">
        <option value="">{{ t('All Suppliers') }}</option>
        <option value="true">{{ t('Active') }}</option>
        <option value="false">{{ t('Inactive') }}</option>
      </select>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <h3>{{ t('No suppliers found') }}</h3>
      <p>{{ t('No suppliers match your filters.') }}</p>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>{{ t('Name') }}</th>
            <th>{{ t('Org. Number') }}</th>
            <th>{{ t('Contact') }}</th>
            <th>{{ t('Email') }}</th>
            <th>{{ t('Phone') }}</th>
            <th>{{ t('Status') }}</th>
            <th>{{ t('Created') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.id" class="clickable-row" @click="$router.push(`/app/suppliers/${s.id}`)">
            <td><strong>{{ s.name }}</strong></td>
            <td>{{ s.organizationNumber || '-' }}</td>
            <td>{{ s.contactName || '-' }}</td>
            <td>{{ s.email || '-' }}</td>
            <td>{{ s.phone || '-' }}</td>
            <td><span class="status-badge" :class="s.active ? 'success' : 'warning'">{{ s.active ? t('Active') : t('Inactive') }}</span></td>
            <td>{{ formatDate(s.createdAt) }}</td>
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
