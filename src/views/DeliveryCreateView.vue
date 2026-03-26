<script setup lang="ts">
/**
 * Delivery creation view presenting a form to record a new delivery
 * with supplier selection, date, document number, notes, and dynamic
 * item rows that can be added or removed.
 * Redirects to the deliveries list on successful submission.
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supplierApi, type Supplier } from '@/api/suppliers'
import { deliveryApi, type CreateDeliveryItemRequest } from '@/api/deliveries'
import { HttpError } from '@/api/client'

const router = useRouter()

/** Available suppliers for the select dropdown. */
const suppliers = ref<Supplier[]>([])
/** Whether suppliers are still being loaded. */
const loadingSuppliers = ref(true)
/** Selected supplier ID. */
const supplierId = ref<number | ''>('')
/** Delivery date in ISO format. */
const deliveryDate = ref('')
/** Document or invoice number. */
const documentNumber = ref('')
/** Delivery notes. */
const notes = ref('')
/** Dynamic list of delivery items. */
const items = ref<CreateDeliveryItemRequest[]>([
  { productName: '', quantity: undefined, unit: '', batchLot: '', expiryDate: '' },
])
/** Error message from the last submission attempt. */
const error = ref('')
/** Whether the form is currently being submitted. */
const submitting = ref(false)

onMounted(async () => {
  try {
    suppliers.value = (await supplierApi.list()).filter((s: Supplier) => s.active)
  } finally {
    loadingSuppliers.value = false
  }
})

/** Adds a new empty item row to the items list. */
function addItem() {
  items.value.push({ productName: '', quantity: undefined, unit: '', batchLot: '', expiryDate: '' })
}

/**
 * Removes an item row at the given index.
 * @param index - Index of the item to remove
 */
function removeItem(index: number) {
  if (items.value.length > 1) {
    items.value.splice(index, 1)
  }
}

/**
 * Submits the delivery record to the server.
 * On success navigates back to the deliveries list.
 */
async function submit() {
  if (!supplierId.value) {
    error.value = 'Please select a supplier'
    return
  }
  if (!deliveryDate.value) {
    error.value = 'Please enter a delivery date'
    return
  }
  const validItems = items.value.filter((i) => i.productName.trim())
  if (validItems.length === 0) {
    error.value = 'Please add at least one item with a product name'
    return
  }

  error.value = ''
  submitting.value = true
  try {
    await deliveryApi.create({
      supplierId: Number(supplierId.value),
      deliveryDate: deliveryDate.value,
      documentNumber: documentNumber.value || undefined,
      notes: notes.value || undefined,
      items: validItems.map((i) => ({
        productName: i.productName,
        quantity: i.quantity || undefined,
        unit: i.unit || undefined,
        batchLot: i.batchLot || undefined,
        expiryDate: i.expiryDate || undefined,
        internalIngredientRef: i.internalIngredientRef || undefined,
      })),
    })
    router.push('/app/deliveries')
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to create delivery'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>New Delivery</h1>
      <router-link to="/app/deliveries" class="btn btn-secondary">Back</router-link>
    </div>

    <div class="card">
      <div v-if="error" class="alert-error">{{ error }}</div>
      <form @submit.prevent="submit">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Supplier</label>
            <select v-model="supplierId" class="form-select" required>
              <option value="" disabled>Select a supplier</option>
              <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Delivery Date</label>
            <input v-model="deliveryDate" type="date" class="form-input" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Document Number</label>
            <input v-model="documentNumber" class="form-input" maxlength="100" placeholder="Invoice or delivery note number" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea v-model="notes" class="form-textarea" rows="2" maxlength="2000" placeholder="Optional notes about this delivery" />
        </div>

        <div class="items-section">
          <div class="items-header">
            <h3>Items</h3>
            <button type="button" class="btn btn-secondary btn-sm" @click="addItem">+ Add Item</button>
          </div>

          <div v-for="(item, index) in items" :key="index" class="item-row">
            <div class="item-fields">
              <div class="form-group">
                <label class="form-label">Product Name</label>
                <input v-model="item.productName" class="form-input" placeholder="Product name" required />
              </div>
              <div class="form-group form-group-sm">
                <label class="form-label">Quantity</label>
                <input v-model.number="item.quantity" type="number" class="form-input" min="0" step="any" placeholder="Qty" />
              </div>
              <div class="form-group form-group-sm">
                <label class="form-label">Unit</label>
                <input v-model="item.unit" class="form-input" placeholder="kg, pcs, L" maxlength="20" />
              </div>
              <div class="form-group">
                <label class="form-label">Batch/Lot</label>
                <input v-model="item.batchLot" class="form-input" placeholder="Batch or lot number" maxlength="100" />
              </div>
              <div class="form-group">
                <label class="form-label">Expiry Date</label>
                <input v-model="item.expiryDate" type="date" class="form-input" />
              </div>
              <div class="form-group form-group-action">
                <button v-if="items.length > 1" type="button" class="btn btn-danger btn-sm" @click="removeItem(index)">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="submitting" style="margin-top: 16px;">
          {{ submitting ? 'Creating...' : 'Create Delivery' }}
        </button>
      </form>
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
}
.form-row .form-group {
  flex: 1;
  min-width: 180px;
}
.items-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.items-header h3 {
  margin: 0;
}
.item-row {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 8px;
}
.item-fields {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: flex-end;
}
.item-fields .form-group {
  flex: 1;
  min-width: 140px;
}
.item-fields .form-group-sm {
  flex: 0 0 80px;
  min-width: 80px;
}
.item-fields .form-group-action {
  flex: 0 0 auto;
  min-width: auto;
}
</style>
