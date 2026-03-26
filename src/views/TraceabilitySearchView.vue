<script setup lang="ts">
/**
 * Traceability search view allowing users to search delivery items
 * by product name and/or batch/lot number for food safety traceability.
 * Results are displayed in a table linking items back to their delivery and supplier.
 */
import { ref } from 'vue'
import { deliveryApi, type TraceabilityResult } from '@/api/deliveries'
import { HttpError } from '@/api/client'

/** Search field: product name. */
const productName = ref('')
/** Search field: batch/lot number. */
const batchLot = ref('')
/** Search results. */
const results = ref<TraceabilityResult[]>([])
/** Whether a search has been performed. */
const searched = ref(false)
/** Whether a search is currently in progress. */
const searching = ref(false)
/** Error message from a failed search. */
const error = ref('')

/** Executes the traceability search with the current field values. */
async function search() {
  if (!productName.value.trim() && !batchLot.value.trim()) {
    error.value = 'Please enter a product name or batch/lot number to search'
    return
  }
  error.value = ''
  searching.value = true
  searched.value = false
  try {
    results.value = await deliveryApi.searchTraceability({
      productName: productName.value.trim() || undefined,
      batchLot: batchLot.value.trim() || undefined,
    })
    searched.value = true
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Search failed'
  } finally {
    searching.value = false
  }
}

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
      <h1>Traceability Search</h1>
    </div>

    <div class="card">
      <form @submit.prevent="search">
        <div v-if="error" class="alert-error">{{ error }}</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Product Name</label>
            <input v-model="productName" class="form-input" placeholder="Search by product name" maxlength="255" />
          </div>
          <div class="form-group">
            <label class="form-label">Batch / Lot Number</label>
            <input v-model="batchLot" class="form-input" placeholder="Search by batch or lot number" maxlength="100" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="searching">
          {{ searching ? 'Searching...' : 'Search' }}
        </button>
      </form>
    </div>

    <div v-if="searching" class="loading"><div class="spinner" /></div>

    <div v-else-if="searched && results.length === 0" class="empty-state">
      <h3>No results found</h3>
      <p>No delivery items match your search criteria.</p>
    </div>

    <div v-else-if="searched && results.length > 0" class="card table-wrapper" style="margin-top: 16px;">
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Batch/Lot</th>
            <th>Supplier</th>
            <th>Delivery Date</th>
            <th>Expiry Date</th>
            <th>Delivery</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in results" :key="r.deliveryItemId" class="clickable-row" @click="$router.push(`/app/deliveries/${r.deliveryRecordId}`)">
            <td><strong>{{ r.productName }}</strong></td>
            <td>{{ r.batchLot || '-' }}</td>
            <td>{{ r.supplierName }}</td>
            <td>{{ formatDate(r.deliveryDate) }}</td>
            <td>{{ r.expiryDate ? formatDate(r.expiryDate) : '-' }}</td>
            <td><span class="link-text">View Delivery</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.alert-error {
  padding: 10px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 16px;
}
.form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.form-row .form-group {
  flex: 1;
  min-width: 180px;
}
.clickable-row {
  cursor: pointer;
}
.clickable-row:hover td {
  background: var(--accent-bg);
}
.link-text {
  color: var(--accent);
  font-size: 13px;
}
</style>
