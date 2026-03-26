<script setup lang="ts">
/**
 * Delivery detail view showing full information about a single delivery
 * record including its metadata and an items table.
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { deliveryApi, type DeliveryRecord } from '@/api/deliveries'

const route = useRoute()
/** Delivery ID parsed from the route params. */
const deliveryId = Number(route.params.id)

/** The loaded delivery record, null until fetched. */
const delivery = ref<DeliveryRecord | null>(null)
/** Whether the delivery data is still being loaded. */
const loading = ref(true)

onMounted(async () => {
  try {
    delivery.value = await deliveryApi.get(deliveryId)
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
      <h1>Delivery Detail</h1>
      <router-link to="/app/deliveries" class="btn btn-secondary">Back</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else-if="delivery">
      <div class="card detail-main">
        <div class="info-grid">
          <div><span class="info-label">Supplier</span><span>{{ delivery.supplierName }}</span></div>
          <div><span class="info-label">Delivery Date</span><span>{{ formatDate(delivery.deliveryDate) }}</span></div>
          <div><span class="info-label">Document #</span><span>{{ delivery.documentNumber || '-' }}</span></div>
          <div><span class="info-label">Received By</span><span>{{ delivery.receivedByUsername }}</span></div>
          <div><span class="info-label">Created</span><span>{{ formatDate(delivery.createdAt) }}</span></div>
        </div>
        <div v-if="delivery.notes" class="notes-section">
          <span class="info-label">Notes</span>
          <p class="description">{{ delivery.notes }}</p>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <h2>Items ({{ delivery.items.length }})</h2>
        <div v-if="delivery.items.length === 0" class="text-muted text-sm">No items recorded.</div>
        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Batch/Lot</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in delivery.items" :key="item.id">
                <td><strong>{{ item.productName }}</strong></td>
                <td>{{ item.quantity ?? '-' }}</td>
                <td>{{ item.unit || '-' }}</td>
                <td>{{ item.batchLot || '-' }}</td>
                <td>{{ item.expiryDate ? formatDate(item.expiryDate) : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
.info-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text);
  margin-bottom: 2px;
}
.description {
  color: var(--text-h);
  line-height: 1.6;
  white-space: pre-wrap;
}
.notes-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
</style>
