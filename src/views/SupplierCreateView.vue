<script setup lang="ts">
/**
 * Supplier creation view presenting a form to add a new supplier
 * with name, organization number, contact details, and notes.
 * Redirects to the suppliers list on successful submission.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supplierApi } from '@/api/suppliers'
import { HttpError } from '@/api/client'

const router = useRouter()
/** Bound supplier name input value. */
const name = ref('')
/** Bound organization number input value. */
const organizationNumber = ref('')
/** Bound contact name input value. */
const contactName = ref('')
/** Bound email input value. */
const email = ref('')
/** Bound phone input value. */
const phone = ref('')
/** Bound address input value. */
const address = ref('')
/** Bound notes textarea value. */
const notes = ref('')
/** Error message from the last submission attempt. */
const error = ref('')
/** Whether the form is currently being submitted. */
const submitting = ref(false)

/**
 * Submits the new supplier to the server.
 * On success navigates back to the suppliers list.
 */
async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await supplierApi.create({
      name: name.value,
      organizationNumber: organizationNumber.value || undefined,
      contactName: contactName.value || undefined,
      email: email.value || undefined,
      phone: phone.value || undefined,
      address: address.value || undefined,
      notes: notes.value || undefined,
    })
    router.push('/app/suppliers')
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to create supplier'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>New Supplier</h1>
      <router-link to="/app/suppliers" class="btn btn-secondary">Back</router-link>
    </div>

    <div class="card">
      <div v-if="error" class="alert-error">{{ error }}</div>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input v-model="name" class="form-input" required maxlength="255" placeholder="Supplier company name" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Organization Number</label>
            <input v-model="organizationNumber" class="form-input" maxlength="50" placeholder="e.g. 123 456 789" />
          </div>
          <div class="form-group">
            <label class="form-label">Contact Name</label>
            <input v-model="contactName" class="form-input" maxlength="255" placeholder="Primary contact person" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="email" class="form-input" type="email" maxlength="255" placeholder="contact@supplier.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input v-model="phone" class="form-input" maxlength="50" placeholder="+47 123 45 678" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <input v-model="address" class="form-input" maxlength="500" placeholder="Street address, city" />
        </div>
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea v-model="notes" class="form-textarea" rows="3" maxlength="2000" placeholder="Internal notes about this supplier" />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Creating...' : 'Create Supplier' }}
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
</style>
