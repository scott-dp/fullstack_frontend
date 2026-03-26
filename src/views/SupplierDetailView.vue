<script setup lang="ts">
/**
 * Supplier detail view showing full information about a single supplier,
 * a list of their deliveries, and edit/deactivate controls for managers.
 */
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supplierApi, type Supplier } from '@/api/suppliers'
import { deliveryApi, type DeliveryRecord } from '@/api/deliveries'
import { HttpError } from '@/api/client'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
/** Supplier ID parsed from the route params. */
const supplierId = Number(route.params.id)

/** The loaded supplier, null until fetched. */
const supplier = ref<Supplier | null>(null)
/** Deliveries from this supplier. */
const deliveries = ref<DeliveryRecord[]>([])
/** Whether data is still being loaded. */
const loading = ref(true)
/** Whether edit mode is active. */
const editing = ref(false)
/** Error message from a failed update. */
const error = ref('')
/** Whether an update is being submitted. */
const submitting = ref(false)

/** Edit form fields bound to inputs. */
const form = ref({
  name: '',
  organizationNumber: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
})

onMounted(async () => {
  try {
    supplier.value = await supplierApi.get(supplierId)
    populateForm()
    const allDeliveries = await deliveryApi.list()
    deliveries.value = allDeliveries.filter((d: DeliveryRecord) => d.supplierId === supplierId)
  } finally {
    loading.value = false
  }
})

/** Copies the current supplier data into the edit form fields. */
function populateForm() {
  if (!supplier.value) return
  form.value = {
    name: supplier.value.name,
    organizationNumber: supplier.value.organizationNumber || '',
    contactName: supplier.value.contactName || '',
    email: supplier.value.email || '',
    phone: supplier.value.phone || '',
    address: supplier.value.address || '',
    notes: supplier.value.notes || '',
  }
}

/** Enables edit mode. */
function startEdit() {
  populateForm()
  editing.value = true
  error.value = ''
}

/** Cancels edit mode without saving. */
function cancelEdit() {
  editing.value = false
  error.value = ''
}

/** Saves the edited supplier fields. */
async function saveEdit() {
  error.value = ''
  submitting.value = true
  try {
    supplier.value = await supplierApi.update(supplierId, {
      name: form.value.name,
      organizationNumber: form.value.organizationNumber || undefined,
      contactName: form.value.contactName || undefined,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
      address: form.value.address || undefined,
      notes: form.value.notes || undefined,
    })
    editing.value = false
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to update supplier'
  } finally {
    submitting.value = false
  }
}

/** Toggles the supplier active/inactive status. */
async function toggleActive() {
  if (!supplier.value) return
  error.value = ''
  try {
    supplier.value = await supplierApi.update(supplierId, { active: !supplier.value.active })
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to update supplier'
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
      <h1 v-if="supplier">{{ supplier.name }}</h1>
      <router-link to="/app/suppliers" class="btn btn-secondary">Back</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else-if="supplier">
      <div v-if="error" class="alert-error">{{ error }}</div>

      <!-- Edit mode -->
      <div v-if="editing" class="card">
        <h2>Edit Supplier</h2>
        <form @submit.prevent="saveEdit">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input v-model="form.name" class="form-input" required maxlength="255" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Organization Number</label>
              <input v-model="form.organizationNumber" class="form-input" maxlength="50" />
            </div>
            <div class="form-group">
              <label class="form-label">Contact Name</label>
              <input v-model="form.contactName" class="form-input" maxlength="255" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input v-model="form.email" class="form-input" type="email" maxlength="255" />
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input v-model="form.phone" class="form-input" maxlength="50" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Address</label>
            <input v-model="form.address" class="form-input" maxlength="500" />
          </div>
          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea v-model="form.notes" class="form-textarea" rows="3" maxlength="2000" />
          </div>
          <div class="action-buttons">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Save' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="cancelEdit">Cancel</button>
          </div>
        </form>
      </div>

      <!-- View mode -->
      <div v-else class="card detail-main">
        <div class="meta-row">
          <span class="status-badge" :class="supplier.active ? 'success' : 'warning'">
            {{ supplier.active ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <div class="info-grid">
          <div><span class="info-label">Organization Number</span><span>{{ supplier.organizationNumber || '-' }}</span></div>
          <div><span class="info-label">Contact Name</span><span>{{ supplier.contactName || '-' }}</span></div>
          <div><span class="info-label">Email</span><span>{{ supplier.email || '-' }}</span></div>
          <div><span class="info-label">Phone</span><span>{{ supplier.phone || '-' }}</span></div>
          <div><span class="info-label">Address</span><span>{{ supplier.address || '-' }}</span></div>
          <div><span class="info-label">Created</span><span>{{ formatDate(supplier.createdAt) }}</span></div>
          <div><span class="info-label">Updated</span><span>{{ formatDate(supplier.updatedAt) }}</span></div>
        </div>
        <div v-if="supplier.notes" class="notes-section">
          <span class="info-label">Notes</span>
          <p class="description">{{ supplier.notes }}</p>
        </div>

        <div v-if="auth.hasManageAccess" class="actions-section">
          <div class="action-buttons">
            <button class="btn btn-primary btn-sm" @click="startEdit">Edit</button>
            <button class="btn btn-sm" :class="supplier.active ? 'btn-secondary' : 'btn-primary'" @click="toggleActive">
              {{ supplier.active ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Supplier deliveries -->
      <div class="card" style="margin-top: 16px;">
        <h2>Deliveries</h2>
        <div v-if="deliveries.length === 0" class="text-muted text-sm">No deliveries from this supplier yet.</div>
        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Document #</th>
                <th>Received By</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in deliveries" :key="d.id" class="clickable-row" @click="router.push(`/app/deliveries/${d.id}`)">
                <td>{{ formatDate(d.deliveryDate) }}</td>
                <td>{{ d.documentNumber || '-' }}</td>
                <td>{{ d.receivedByUsername }}</td>
                <td>{{ d.items.length }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.meta-row {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
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
.actions-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}
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
.clickable-row {
  cursor: pointer;
}
.clickable-row:hover td {
  background: var(--accent-bg);
}
</style>
