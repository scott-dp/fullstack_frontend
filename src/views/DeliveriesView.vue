<script setup lang="ts">
/**
 * Deliveries list view displaying all delivery records in a table.
 * Rows are clickable to navigate to the delivery detail page.
 */
import { ref, onMounted } from 'vue'
import { deliveryApi, type DeliveryRecord } from '@/api/deliveries'

/** All delivery records loaded from the server. */
const deliveries = ref<DeliveryRecord[]>([])
/** Whether deliveries are still being fetched. */
const loading = ref(true)

onMounted(async () => {
  try {
    deliveries.value = await deliveryApi.list()
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
  return new Date(iso).toLocaleDateString()
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Deliveries</h1>
      <router-link to="/app/deliveries/new" class="btn btn-primary">New Delivery</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="deliveries.length === 0" class="empty-state">
      <h3>No deliveries found</h3>
      <p>No delivery records have been created yet.</p>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Supplier</th>
            <th>Document #</th>
            <th>Received By</th>
            <th>Items</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in deliveries" :key="d.id" class="clickable-row" @click="$router.push(`/app/deliveries/${d.id}`)">
            <td>{{ formatDate(d.deliveryDate) }}</td>
            <td><strong>{{ d.supplierName }}</strong></td>
            <td>{{ d.documentNumber || '-' }}</td>
            <td>{{ d.receivedByUsername }}</td>
            <td>{{ d.items.length }}</td>
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
