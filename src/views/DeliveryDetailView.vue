<script setup lang="ts">
/**
 * Delivery detail view showing full information about a single delivery
 * record including its metadata and an items table.
 */
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { deliveryApi, type DeliveryRecord } from '@/api/deliveries'

const route = useRoute()
/** Delivery ID parsed from the route params. */
const deliveryId = Number(route.params.id)

/** The loaded delivery record, null until fetched. */
const delivery = ref<DeliveryRecord | null>(null)
/** Whether the delivery data is still being loaded. */
const loading = ref(true)
const { t, locale } = useI18n()

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
  return new Date(iso).toLocaleDateString(locale.value)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Delivery Detail') }}</h1>
      <router-link to="/app/deliveries" class="btn btn-secondary">{{ t('Back') }}</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else-if="delivery">
      <div class="card detail-main">
        <div class="info-grid">
          <div><span class="info-label">{{ t('Supplier') }}</span><span>{{ delivery.supplierName }}</span></div>
          <div><span class="info-label">{{ t('Delivery Date') }}</span><span>{{ formatDate(delivery.deliveryDate) }}</span></div>
          <div><span class="info-label">{{ t('Document #') }}</span><span>{{ delivery.documentNumber || '-' }}</span></div>
          <div><span class="info-label">{{ t('Received By') }}</span><span>{{ delivery.receivedByUsername }}</span></div>
          <div><span class="info-label">{{ t('Created') }}</span><span>{{ formatDate(delivery.createdAt) }}</span></div>
        </div>
        <div v-if="delivery.notes" class="notes-section">
          <span class="info-label">{{ t('Notes') }}</span>
          <p class="description">{{ delivery.notes }}</p>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <h2>{{ t('Items') }} ({{ delivery.items.length }})</h2>
        <div v-if="delivery.items.length === 0" class="text-muted text-sm">{{ t('No items recorded.') }}</div>
        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{{ t('Product Name') }}</th>
                <th>{{ t('Quantity') }}</th>
                <th>{{ t('Unit') }}</th>
                <th>{{ t('Batch/Lot') }}</th>
                <th>{{ t('Expiry Date') }}</th>
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
